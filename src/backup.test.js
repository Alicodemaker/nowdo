import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createState, addProject, capture, nowStep, markDone } from './store.js'
import { exportBackup, importBackup } from './backup.js'

test('a backup restores every Project, Step, done time and the focus', () => {
  let state = addProject(createState(), { id: 'taxes', name: 'Do my taxes', steps: ['Find MitID', 'Log in'], focus: true })
  state = capture(state, 'Buy milk')
  state = markDone(state, nowStep(state).step.id, new Date(2026, 8, 30, 10, 0))
  assert.deepEqual(importBackup(exportBackup(state)), state)
})

test('a file that is not JSON is rejected with a clear message', () => {
  assert.throws(() => importBackup('hello'), { message: "This file isn't a Do Now backup." })
})

test('JSON from something other than Do Now is rejected', () => {
  assert.throws(() => importBackup('{"projects": 3}'), { message: "This file isn't a Do Now backup." })
})

test('a backup with a broken Step is rejected instead of half-imported', () => {
  const text = JSON.stringify({
    app: 'do-now',
    version: 1,
    state: { focusId: 'loose-ends', projects: [{ id: 'loose-ends', name: 'Loose ends', steps: [{ id: 'a' }] }] },
  })
  assert.throws(() => importBackup(text), { message: "This file isn't a Do Now backup." })
})

test('a backup without Loose ends gets it back, so capture still has a home', () => {
  const text = JSON.stringify({ app: 'do-now', version: 1, state: { focusId: 'x', projects: [] } })
  const state = importBackup(text)
  assert.deepEqual(state.projects.map((p) => p.name), ['Loose ends'])
  assert.equal(state.focusId, 'loose-ends')
})
