import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  createState, addProject, nowStep, markDone, undoDone, stepsToday,
  notNow, moveToTop, makeSmaller, capture, LOOSE_ENDS_ID,
  setFocus, isFinished, editStep, deleteStep, deleteProject,
} from './store.js'

test('a fresh state has an empty Loose ends project in focus, so Now is empty', () => {
  const state = createState()
  assert.deepEqual(state.projects.map((p) => p.name), ['Loose ends'])
  assert.equal(nowStep(state), null)
})

test('Now shows the first Step of the Focus project', () => {
  let state = createState()
  state = addProject(state, { id: 'taxes', name: 'Do my taxes', steps: ['Find MitID', 'Log in to skat.dk'], focus: true })
  const now = nowStep(state)
  assert.equal(now.step.text, 'Find MitID')
  assert.equal(now.project.name, 'Do my taxes')
  assert.equal(now.position, 1)
  assert.equal(now.total, 2)
})

const taxes = () =>
  addProject(createState(), {
    id: 'taxes',
    name: 'Do my taxes',
    steps: ['Find MitID', 'Log in to skat.dk', 'Check the numbers'],
    focus: true,
  })

test('marking the Now Step done moves Now to the next Step', () => {
  let state = taxes()
  state = markDone(state, nowStep(state).step.id, new Date(2026, 8, 30, 10, 0))
  assert.equal(nowStep(state).step.text, 'Log in to skat.dk')
  assert.equal(nowStep(state).position, 2)
})

test('undo brings a done Step back as Now', () => {
  let state = taxes()
  const id = nowStep(state).step.id
  state = markDone(state, id, new Date(2026, 8, 30, 10, 0))
  state = undoDone(state, id)
  assert.equal(nowStep(state).step.text, 'Find MitID')
})

test('Steps today counts Steps finished since local midnight only', () => {
  let state = taxes()
  state = markDone(state, nowStep(state).step.id, new Date(2026, 8, 29, 23, 50))
  state = markDone(state, nowStep(state).step.id, new Date(2026, 8, 30, 0, 5))
  state = markDone(state, nowStep(state).step.id, new Date(2026, 8, 30, 9, 0))
  assert.equal(stepsToday(state, new Date(2026, 8, 30, 12, 0)), 2)
  assert.equal(stepsToday(state, new Date(2026, 9, 1, 8, 0)), 0)
})

test('an undone Step no longer counts towards Steps today', () => {
  let state = taxes()
  const id = nowStep(state).step.id
  state = markDone(state, id, new Date(2026, 8, 30, 10, 0))
  state = undoDone(state, id)
  assert.equal(stepsToday(state, new Date(2026, 8, 30, 12, 0)), 0)
})

const openTexts = (state, projectId) =>
  state.projects.find((p) => p.id === projectId).steps.filter((s) => !s.doneAt).map((s) => s.text)

test('Not now moves the Now Step to the end of its Project', () => {
  let state = taxes()
  state = notNow(state, nowStep(state).step.id)
  assert.deepEqual(openTexts(state, 'taxes'), ['Log in to skat.dk', 'Check the numbers', 'Find MitID'])
})

test('Move to top makes a Step the next Now, even with done Steps before it', () => {
  let state = taxes()
  state = markDone(state, nowStep(state).step.id, new Date(2026, 8, 30, 10, 0))
  const last = state.projects[1].steps[2].id
  state = moveToTop(state, last)
  assert.equal(nowStep(state).step.text, 'Check the numbers')
})

test('Make it smaller puts a tinier Step right before the Now Step', () => {
  let state = taxes()
  state = makeSmaller(state, 'Open your PC')
  assert.deepEqual(openTexts(state, 'taxes'), ['Open your PC', 'Find MitID', 'Log in to skat.dk', 'Check the numbers'])
  assert.equal(nowStep(state).step.text, 'Open your PC')
})

test('capture adds a Step to Loose ends without changing the Focus project', () => {
  let state = taxes()
  state = capture(state, 'Buy milk')
  assert.deepEqual(openTexts(state, LOOSE_ENDS_ID), ['Buy milk'])
  assert.equal(nowStep(state).project.name, 'Do my taxes')
})

test('blank text is never saved as a Step', () => {
  let state = taxes()
  state = capture(state, '   ')
  state = makeSmaller(state, '')
  assert.deepEqual(openTexts(state, LOOSE_ENDS_ID), [])
  assert.equal(nowStep(state).step.text, 'Find MitID')
})

test('setting a Focus project changes what Now shows', () => {
  let state = taxes()
  state = capture(state, 'Buy milk')
  state = setFocus(state, LOOSE_ENDS_ID)
  assert.equal(nowStep(state).step.text, 'Buy milk')
})

test('a Project is Finished once every Step is done, and Now is then empty', () => {
  let state = taxes()
  for (let i = 0; i < 3; i++) state = markDone(state, nowStep(state).step.id, new Date(2026, 8, 30, 10, i))
  assert.equal(isFinished(state.projects[1]), true)
  assert.equal(nowStep(state), null)
})

test('an empty Project and Loose ends are never Finished', () => {
  let state = addProject(createState(), { id: 'empty', name: 'Someday' })
  state = capture(state, 'Buy milk')
  state = markDone(state, state.projects[0].steps[0].id, new Date(2026, 8, 30, 10, 0))
  assert.equal(isFinished(state.projects[0]), false)
  assert.equal(isFinished(state.projects[1]), false)
})

test('editing a Step changes its text, and blank edits are ignored', () => {
  let state = taxes()
  const id = nowStep(state).step.id
  state = editStep(state, id, '  Find my MitID app ')
  state = editStep(state, id, ' ')
  assert.equal(nowStep(state).step.text, 'Find my MitID app')
})

test('deleting the Now Step makes the next Step Now', () => {
  let state = taxes()
  state = deleteStep(state, nowStep(state).step.id)
  assert.equal(nowStep(state).step.text, 'Log in to skat.dk')
  assert.equal(nowStep(state).total, 2)
})

test('deleting the Focus project puts Loose ends in focus', () => {
  let state = capture(taxes(), 'Buy milk')
  state = deleteProject(state, 'taxes')
  assert.deepEqual(state.projects.map((p) => p.name), ['Loose ends'])
  assert.equal(nowStep(state).step.text, 'Buy milk')
})

test('Loose ends cannot be deleted', () => {
  const state = deleteProject(createState(), LOOSE_ENDS_ID)
  assert.deepEqual(state.projects.map((p) => p.name), ['Loose ends'])
})

test('a Project needs a name, and blank Steps are dropped', () => {
  let state = addProject(createState(), { name: '  ', steps: ['a'] })
  assert.equal(state.projects.length, 1)
  state = addProject(state, { id: 'p', name: ' Clean flat ', steps: ['Dishes', ' ', ''] })
  assert.equal(state.projects[1].name, 'Clean flat')
  assert.deepEqual(openTexts(state, 'p'), ['Dishes'])
})
