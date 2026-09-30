// The Projects list, plus the focus picker sheet that Now also uses.
import { isFinished, setFocus } from './store.js'
import { esc, openSheet } from './ui.js'

const openSteps = (project) => project.steps.filter((s) => !s.doneAt).length

export function stepsLeft(project) {
  const n = openSteps(project)
  return n === 0 ? 'Nothing left' : `${n} ${n === 1 ? 'step' : 'steps'} left`
}

function row(state, project) {
  const focus = project.id === state.focusId
  return `
    <li>
      <a class="project-row" href="#project/${esc(project.id)}">
        <span class="project-name">${esc(project.name)}</span>
        <span class="project-meta">${focus ? '<span class="focus-badge">Focus</span>' : ''}${stepsLeft(project)}</span>
      </a>
    </li>`
}

export function view(app) {
  const { state } = app
  const active = state.projects.filter((p) => !isFinished(p))
  const finished = state.projects.filter(isFinished)
  return `
    <div class="screen">
      <header class="screen-top">
        <h1 class="screen-title">Projects</h1>
      </header>
      <ul class="project-list">${active.map((p) => row(state, p)).join('')}</ul>
      ${
        finished.length
          ? `<details class="finished">
              <summary>Finished (${finished.length})</summary>
              <ul class="project-list">${finished.map((p) => row(state, p)).join('')}</ul>
            </details>`
          : ''
      }
    </div>`
}

export const actions = {}

// Pick which Project Now shows. Only Projects with something left to do.
export function openFocusPicker(app) {
  const { state } = app
  const choices = state.projects.filter((p) => openSteps(p) > 0 || p.id === state.focusId)
  const sheet = openSheet(`
    <h2 class="sheet-title" id="sheet-title">Focus on</h2>
    <p class="sheet-hint">Now shows the next step of the project you pick.</p>
    <ul class="moves">
      ${choices
        .map(
          (p) => `<li><button class="move focus-choice" type="button" data-id="${esc(p.id)}"${
            p.id === state.focusId ? ' aria-current="true"' : ''
          }><span>${esc(p.name)}</span><span class="project-meta">${
            p.id === state.focusId ? '<span class="focus-badge">Focus</span>' : ''
          }${stepsLeft(p)}</span></button></li>`,
        )
        .join('')}
    </ul>
    <a class="quiet" href="#projects">All projects</a>`)
  sheet.setAttribute('aria-labelledby', 'sheet-title')
  sheet.querySelectorAll('.focus-choice').forEach((button) =>
    button.addEventListener('click', () => {
      sheet.close()
      app.commit(setFocus(app.state, button.dataset.id))
    }),
  )
  sheet.querySelector('a').addEventListener('click', () => sheet.close())
}
