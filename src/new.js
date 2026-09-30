// New project: name → Brain dump (talk or type) → review the Steps → save.
import { addProject } from './store.js'
import { splitBrainDump } from './braindump.js'
import { canListen, listen } from './speech.js'
import { esc } from './ui.js'

// The draft lives in memory, so switching tabs mid-way keeps it.
const emptyDraft = () => ({ stage: 'name', name: '', dump: '', steps: [] })
let draft = emptyDraft()
let stopListening = null
let micMessage = ''

const MIC_ERRORS = {
  network: 'Voice needs internet. Type instead, or use the mic on your keyboard.',
  'not-allowed': 'Microphone access is off. Allow it in your browser settings, or type instead.',
  'service-not-allowed': 'Microphone access is off. Allow it in your browser settings, or type instead.',
}

const micIcon =
  '<svg aria-hidden="true" viewBox="0 0 24 24" width="40" height="40"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'

const cancel = '<a class="back" href="#projects" data-action="cancel">Cancel</a>'

function nameView() {
  return `
    <div class="screen">
      ${cancel}
      <form class="new-form" data-form="name">
        <label class="screen-title" for="project-name">What’s the project?</label>
        <p class="sheet-hint">A few words is plenty, like “Do my taxes”.</p>
        <div class="field">
          <input id="project-name" name="name" autocomplete="off" enterkeyhint="next" maxlength="80" value="${esc(draft.name)}" placeholder="Do my taxes…" />
          <button class="button" type="submit">Next</button>
        </div>
      </form>
    </div>`
}

function dumpView() {
  const listening = Boolean(stopListening)
  return `
    <div class="screen">
      ${cancel}
      <form class="new-form" data-form="dump">
        <h1 class="screen-title">${esc(draft.name)}</h1>
        <label class="sheet-hint" for="dump">Talk or type about it, however messy. It becomes tiny steps you can check.</label>
        ${
          canListen
            ? `<div class="mic-zone${listening ? ' is-listening' : ''}">
                <button class="mic" type="button" data-action="mic" aria-pressed="${listening}">
                  ${micIcon}<span class="visually-hidden">${listening ? 'Stop listening' : 'Talk about it'}</span>
                </button>
                <p class="mic-hint" aria-live="polite">${micMessage || (listening ? 'Listening… tap to stop.' : 'Tap to talk.')}</p>
              </div>`
            : '<p class="mic-hint">To talk instead of typing, tap the mic on your keyboard.</p>'
        }
        <textarea id="dump" name="dump" rows="6" placeholder="I need to find the papers, then log in to skat.dk…">${esc(draft.dump)}</textarea>
        <p class="interim" aria-hidden="true"></p>
        <button class="button" type="submit">Turn into steps</button>
      </form>
    </div>`
}

function reviewView() {
  return `
    <div class="screen">
      <button class="back" type="button" data-action="back-to-dump">
        <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M10 4L6 8l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Back to the brain dump
      </button>
      <form class="new-form" data-form="save">
        <h1 class="screen-title">${esc(draft.name)}</h1>
        <p class="sheet-hint">${
          draft.steps.length
            ? 'Check the steps. Change or remove anything, then save.'
            : 'No steps found yet. Add one below, or go back and say a bit more.'
        }</p>
        <ol class="review-list">
          ${draft.steps
            .map(
              (text, i) => `
            <li class="review-step">
              <label class="visually-hidden" for="step-${i}">Step ${i + 1}</label>
              <input id="step-${i}" name="step" autocomplete="off" maxlength="200" value="${esc(text)}" />
              <button class="remove" type="button" data-action="remove-step" data-index="${i}" aria-label="Remove step ${i + 1}">
                <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"/></svg>
              </button>
            </li>`,
            )
            .join('')}
        </ol>
        <button class="quiet" type="button" data-action="add-row">Add a step</button>
        <button class="button save" type="submit">Save steps</button>
      </form>
    </div>`
}

const VIEWS = { name: nameView, dump: dumpView, review: reviewView }

export function view() {
  return VIEWS[draft.stage]()
}

// Keep what's typed before the screen redraws.
function readDump() {
  const box = document.getElementById('dump')
  if (box) draft.dump = box.value
}
function readSteps() {
  draft.steps = [...document.querySelectorAll('.review-step input')].map((input) => input.value)
}

function stopMic() {
  stopListening?.()
  stopListening = null
}

export const actions = {
  name(app, form) {
    const name = form.elements.name.value.trim()
    if (!name) return form.elements.name.focus()
    draft.name = name
    draft.stage = 'dump'
    app.render()
    document.getElementById('dump').focus()
  },
  mic(app) {
    readDump()
    micMessage = ''
    if (stopListening) {
      stopMic()
      return app.render()
    }
    stopListening = listen({
      onText(phrase) {
        const box = document.getElementById('dump')
        draft.dump = `${box.value.trim()} ${phrase.trim()}`.trim()
        box.value = draft.dump
      },
      onInterim(text) {
        const line = document.querySelector('.interim')
        if (line) line.textContent = text
      },
      onError(error) {
        micMessage = MIC_ERRORS[error] ?? ''
      },
      onEnd() {
        stopListening = null
        readDump()
        app.render()
      },
    })
    app.render()
  },
  dump(app, form) {
    stopMic()
    draft.dump = form.elements.dump.value
    draft.steps = splitBrainDump(draft.dump)
    draft.stage = 'review'
    app.render()
  },
  'back-to-dump'(app) {
    readSteps()
    draft.stage = 'dump'
    app.render()
  },
  'remove-step'(app, button) {
    readSteps()
    draft.steps.splice(Number(button.dataset.index), 1)
    app.render()
  },
  'add-row'(app) {
    readSteps()
    draft.steps.push('')
    app.render()
    document.getElementById(`step-${draft.steps.length - 1}`).focus()
  },
  save(app) {
    readSteps()
    if (!draft.steps.some((text) => text.trim())) return actions['add-row'](app)
    const next = addProject(app.state, { name: draft.name, steps: draft.steps, focus: true })
    draft = emptyDraft()
    location.hash = 'now'
    app.commit(next)
  },
  cancel() {
    stopMic()
    draft = emptyDraft()
  },
}
