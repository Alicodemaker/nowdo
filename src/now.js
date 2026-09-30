// The Now screen: one Step, a 2-minute Start, Done, Not now.
import { nowStep, stepsToday, markDone, undoDone, notNow, isFinished, capture, makeSmaller } from './store.js'
import { firstMoves } from './firstmoves.js'
import { openFocusPicker } from './projects.js'
import { canUseClaude, tinyFirstMove } from './claude.js'
import { esc, toast, burst, buzz, openSheet } from './ui.js'

const START_MS = 2 * 60 * 1000
// Longer Steps get a smaller size so Start stays on screen.
const LONG_STEP = 60

// The Start timer lives in memory only. It belongs to one Step and resets
// when Now moves on. Phases: idle → running → ask ("Keep going?") → flow.
let timer = { stepId: null, phase: 'idle', startedAt: 0 }
let timerEnd
let lastStepId = null

function syncTimer(stepId, rerender) {
  if (timer.stepId !== stepId) {
    clearTimeout(timerEnd)
    timer = { stepId, phase: 'idle', startedAt: 0 }
  }
  if (timer.phase === 'running') {
    const left = START_MS - (Date.now() - timer.startedAt)
    clearTimeout(timerEnd)
    if (left <= 0) timer.phase = 'ask'
    else timerEnd = setTimeout(() => { buzz([30, 60, 30]); rerender() }, left)
  }
}

const icon = {
  chevron: '<svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  plus: '<svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
  check: '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
}

function header(state, focus) {
  const today = stepsToday(state)
  return `
    <header class="now-top">
      <button class="project-chip" type="button" data-action="pick-focus" aria-label="Switch project. Current: ${esc(focus.name)}">
        <span>${esc(focus.name)}</span>${icon.chevron}
      </button>
      <p class="today"><strong>${today}</strong> ${today === 1 ? 'step' : 'steps'} today</p>
    </header>`
}

const captureButton = `<button class="capture" type="button" data-action="capture" aria-label="Add a step to Loose ends">${icon.plus}</button>`

function emptyView(state, focus) {
  const finished = isFinished(focus)
  return `
    <div class="now">
      ${header(state, focus)}
      <section class="now-step now-empty">
        <h1 class="step-text">${finished ? `${esc(focus.name)} is finished.` : 'Nothing to do here yet.'}</h1>
        <p class="empty-hint">${finished ? 'Every step is done. Pick what to focus on next.' : 'Tap + to jot down a step, or start a project.'}</p>
        ${
          finished
            ? '<button class="quiet" type="button" data-action="pick-focus">Pick your next focus</button>'
            : '<a class="quiet" href="#new">Start a project</a>'
        }
      </section>
      <div class="now-bottom">${captureButton}</div>
    </div>`
}

const START_ZONE = {
  idle: { label: 'Start', action: 'start', hint: 'Just 2 minutes.' },
  running: { label: 'Going', action: '', hint: 'You started. That was the hard part.' },
  ask: { label: 'Keep going', action: 'keep-going', hint: '2 minutes done. Keep going, or tap Done.' },
  flow: { label: 'Going', action: '', hint: 'No timer now. Tap Done when it’s done.' },
}

function startZone() {
  const zone = START_ZONE[timer.phase]
  return `
    <div class="start-zone is-${timer.phase}">
      <div class="start-ring">
        <button class="start" type="button" data-action="${zone.action}" aria-describedby="start-hint">${zone.label}</button>
      </div>
      <p class="start-hint" id="start-hint">${zone.hint}</p>
    </div>`
}

export function view(app) {
  const { state } = app
  const focus = state.projects.find((p) => p.id === state.focusId)
  const now = nowStep(state)
  if (!now) {
    lastStepId = null
    return emptyView(state, focus)
  }
  syncTimer(now.step.id, app.render)
  const isNew = lastStepId !== null && lastStepId !== now.step.id
  lastStepId = now.step.id
  return `
    <div class="now">
      ${header(state, focus)}
      <section class="now-step" aria-labelledby="step-text">
        <p class="step-count">Step ${now.position} of ${now.total}</p>
        <h1 class="step-text${isNew ? ' is-new' : ''}${now.step.text.length > LONG_STEP ? ' is-long' : ''}" id="step-text">${esc(now.step.text)}</h1>
        <div class="step-actions">
          <button class="quiet" type="button" data-action="smaller">Make it smaller</button>
          <button class="quiet" type="button" data-action="not-now">Not now</button>
        </div>
      </section>
      ${startZone()}
      <div class="now-bottom">
        ${captureButton}
        <button class="done" type="button" data-action="done">${icon.check} Done</button>
      </div>
    </div>`
}

// After each render: a running ring picks up where the timer is, so it never
// restarts. Set from JS rather than a style attribute, which the CSP blocks.
export function mounted(root) {
  const ring = root.querySelector('.is-running .start-ring')
  if (ring) ring.style.animationDelay = `-${Date.now() - timer.startedAt}ms`
}

export const actions = {
  start(app) {
    timer = { ...timer, phase: 'running', startedAt: Date.now() }
    buzz()
    app.render()
  },
  'keep-going'(app) {
    timer.phase = 'flow'
    app.render()
  },
  done(app, button) {
    const { step, project } = nowStep(app.state)
    const next = markDone(app.state, step.id)
    if (isFinished(next.projects.find((p) => p.id === project.id))) {
      // The last Step of a Project: the bigger celebration.
      burst(document.querySelector('.start'), { big: true })
      buzz([40, 60, 40, 60, 120])
    } else {
      burst(button)
      buzz([20, 40, 20])
    }
    app.commit(next)
    toast(`Done: ${step.text}`, { label: 'Undo', run: () => app.commit(undoDone(app.state, step.id)) })
  },
  'not-now'(app) {
    app.commit(notNow(app.state, nowStep(app.state).step.id))
  },
  'pick-focus'(app) {
    openFocusPicker(app)
  },
  capture(app) {
    const sheet = openSheet(`
      <form class="sheet-form">
        <h2 class="sheet-title" id="sheet-title">Jot it down</h2>
        <p class="sheet-hint">It goes to Loose ends, so you can get back to what you were doing.</p>
        <div class="field">
          <label class="visually-hidden" for="capture-text">New step</label>
          <input id="capture-text" name="text" autocomplete="off" enterkeyhint="done" maxlength="200" placeholder="Buy milk…" />
          <button class="button" type="submit">Add</button>
        </div>
      </form>`)
    sheet.setAttribute('aria-labelledby', 'sheet-title')
    sheet.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault()
      const text = event.target.elements.text.value
      if (!text.trim()) return
      app.commit(capture(app.state, text))
      sheet.close()
      toast('Added to Loose ends')
    })
  },
  smaller(app) {
    const { step, project } = nowStep(app.state)
    const moves = firstMoves(step.text)
    const sheet = openSheet(`
      <h2 class="sheet-title" id="sheet-title">Make it smaller</h2>
      <p class="sheet-hint">What’s the very first movement? Tap one, or type your own.</p>
      <ul class="moves">
        ${moves.map((move) => `<li><button class="move" type="button">${esc(move)}</button></li>`).join('')}
      </ul>
      <form class="sheet-form field">
        <label class="visually-hidden" for="own-move">Your own first move</label>
        <input id="own-move" name="text" autocomplete="off" enterkeyhint="done" maxlength="200" placeholder="Type your own…" />
        <button class="button" type="submit">Add</button>
      </form>`)
    sheet.setAttribute('aria-labelledby', 'sheet-title')
    const add = (text) => {
      if (!text.trim()) return
      app.commit(makeSmaller(app.state, text))
      sheet.close()
    }
    sheet.querySelectorAll('.move').forEach((button) => button.addEventListener('click', () => add(button.textContent)))
    sheet.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault()
      add(event.target.elements.text.value)
    })
    // With a key and a connection, Claude adds one tailored first move on top.
    if (canUseClaude()) {
      const slot = document.createElement('li')
      slot.className = 'move-waiting'
      slot.textContent = 'Asking Claude for a first move…'
      sheet.querySelector('.moves').prepend(slot)
      tinyFirstMove(step.text, project.name)
        .then((move) => {
          slot.className = ''
          slot.innerHTML = `<button class="move" type="button">${esc(move)}</button>`
          slot.querySelector('button').addEventListener('click', () => add(move))
        })
        .catch(() => slot.remove())
    }
  },
}
