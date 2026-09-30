// One Project: its Steps in order, add/edit/delete/move to top, Done (n).
import { addStep, editStep, deleteStep, moveToTop, deleteProject, setFocus, LOOSE_ENDS_ID } from './store.js'
import { stepsLeft } from './projects.js'
import { esc, openSheet, toast } from './ui.js'

const find = (state, id) => state.projects.find((p) => p.id === id)

export function view(app, id) {
  const project = find(app.state, id)
  if (!project) {
    location.replace('#projects')
    return ''
  }
  const open = project.steps.filter((s) => !s.doneAt)
  const done = project.steps.filter((s) => s.doneAt)
  const inFocus = app.state.focusId === project.id
  return `
    <div class="screen">
      <a class="back" href="#projects">
        <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M10 4L6 8l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Projects
      </a>
      <header class="project-head">
        <h1 class="screen-title">${esc(project.name)}</h1>
        <p class="project-meta">${stepsLeft(project)}</p>
        ${
          inFocus
            ? '<p class="focus-note"><span class="focus-badge">Focus</span> Now shows this project.</p>'
            : open.length
              ? '<button class="button" type="button" data-action="focus">Focus on this</button>'
              : ''
        }
      </header>
      <ol class="step-list">
        ${open
          .map((s) => `<li><button class="step-row" type="button" data-action="step" data-id="${esc(s.id)}">${esc(s.text)}</button></li>`)
          .join('')}
      </ol>
      <form class="field add-step" data-form="add-step">
        <label class="visually-hidden" for="add-step">Add a step</label>
        <input id="add-step" name="text" autocomplete="off" enterkeyhint="done" maxlength="200" placeholder="Add a step…" />
        <button class="button" type="submit">Add</button>
      </form>
      ${
        done.length
          ? `<details class="done-list">
              <summary>Done (${done.length})</summary>
              <ul>${done.map((s) => `<li>${esc(s.text)}</li>`).join('')}</ul>
            </details>`
          : ''
      }
      ${
        project.id === LOOSE_ENDS_ID
          ? ''
          : '<button class="danger-link" type="button" data-action="delete-project">Delete project</button>'
      }
    </div>`
}

export const actions = {
  focus(app, _el, id) {
    app.commit(setFocus(app.state, id))
    location.hash = 'now'
  },
  'add-step'(app, form, id) {
    const text = form.elements.text.value
    if (!text.trim()) return
    app.commit(addStep(app.state, id, text))
    document.getElementById('add-step').focus()
  },
  step(app, el, id) {
    const stepId = el.dataset.id
    const step = find(app.state, id).steps.find((s) => s.id === stepId)
    const sheet = openSheet(`
      <h2 class="sheet-title" id="sheet-title">Edit step</h2>
      <form class="field sheet-form">
        <label class="visually-hidden" for="edit-step">Step</label>
        <input id="edit-step" name="text" autocomplete="off" enterkeyhint="done" maxlength="200" value="${esc(step.text)}" />
        <button class="button" type="submit">Save</button>
      </form>
      <div class="sheet-actions">
        <button class="quiet" type="button" data-sheet="top">Move to top</button>
        <button class="quiet danger" type="button" data-sheet="delete">Delete step</button>
      </div>`)
    sheet.setAttribute('aria-labelledby', 'sheet-title')
    sheet.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault()
      app.commit(editStep(app.state, stepId, event.target.elements.text.value))
      sheet.close()
    })
    sheet.querySelector('[data-sheet="top"]').addEventListener('click', () => {
      app.commit(moveToTop(app.state, stepId))
      sheet.close()
    })
    sheet.querySelector('[data-sheet="delete"]').addEventListener('click', () => {
      const before = app.state
      app.commit(deleteStep(app.state, stepId))
      sheet.close()
      toast('Step deleted', { label: 'Undo', run: () => app.commit(before) })
    })
  },
  'delete-project'(app, _el, id) {
    const project = find(app.state, id)
    const n = project.steps.length
    const sheet = openSheet(`
      <h2 class="sheet-title" id="sheet-title">Delete ${esc(project.name)}?</h2>
      <p class="sheet-hint">${n ? `Its ${n} ${n === 1 ? 'step goes' : 'steps go'} too. This can’t be undone.` : 'This can’t be undone.'}</p>
      <div class="sheet-actions">
        <button class="quiet" type="button" data-sheet="keep">Keep it</button>
        <button class="button danger" type="button" data-sheet="delete">Delete project</button>
      </div>`)
    sheet.setAttribute('aria-labelledby', 'sheet-title')
    sheet.querySelector('[data-sheet="keep"]').addEventListener('click', () => sheet.close())
    sheet.querySelector('[data-sheet="delete"]').addEventListener('click', () => {
      sheet.close()
      location.hash = 'projects'
      app.commit(deleteProject(app.state, id))
    })
  },
}
