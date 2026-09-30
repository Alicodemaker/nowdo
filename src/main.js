import './theme.css'
import './base.css'
import './ui.css'
import './now.css'
import './projects.css'
import { load, save } from './storage.js'
import * as now from './now.js'
import * as projects from './projects.js'
import * as project from './project.js'
import * as newProject from './new.js'
import * as settings from './settings.js'

const root = document.getElementById('app')
const screens = { now, projects, project, new: newProject, settings }

// "#project/abc" → { name: 'project', param: 'abc' }. Unknown hashes show Now.
function route() {
  const [name, param] = location.hash.slice(1).split('/')
  return screens[name] ? { name, param } : { name: 'now' }
}

const app = {
  state: load(),
  // Save a new state and redraw. Every change goes through here.
  commit(next) {
    app.state = next
    save(next)
    app.render()
  },
  render() {
    const { name, param } = route()
    root.innerHTML = screens[name].view(app, param)
    screens[name].mounted?.(root)
    const tab = name === 'now' ? 'now' : 'projects'
    document.querySelectorAll('.tab').forEach((link) => {
      if (link.getAttribute('href') === `#${tab}`) link.setAttribute('aria-current', 'page')
      else link.removeAttribute('aria-current')
    })
  },
}

// One listener each for clicks, forms and file pickers: elements name their
// action in data-action (buttons), data-form (forms) or data-change (inputs).
root.addEventListener('click', (event) => {
  const el = event.target.closest('[data-action]')
  const { name, param } = route()
  screens[name].actions[el?.dataset.action]?.(app, el, param)
})
root.addEventListener('submit', (event) => {
  event.preventDefault()
  const { name, param } = route()
  screens[name].actions[event.target.dataset.form]?.(app, event.target, param)
})

root.addEventListener('change', (event) => {
  const { name, param } = route()
  screens[name].actions[event.target.dataset.change]?.(app, event.target, param)
})

window.addEventListener('hashchange', () => {
  app.render()
  window.scrollTo(0, 0)
})
// Coming back to the app: the timer may have ended and midnight may have passed.
document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && app.render())

app.render()
