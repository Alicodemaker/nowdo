import './theme.css'
import './base.css'
import './ui.css'
import './now.css'
import { load, save } from './storage.js'
import * as now from './now.js'

const root = document.getElementById('app')
const screens = { now }

const app = {
  state: load(),
  // Save a new state and redraw. Every change goes through here.
  commit(next) {
    app.state = next
    save(next)
    app.render()
  },
  render() {
    const name = location.hash.slice(1) in screens ? location.hash.slice(1) : 'now'
    root.innerHTML = screens[name].view(app.state, app.render)
    document.querySelectorAll('.tab').forEach((tab) => {
      if (tab.getAttribute('href') === `#${name}`) tab.setAttribute('aria-current', 'page')
      else tab.removeAttribute('aria-current')
    })
  },
}

// One click listener for the whole app: buttons name their action in data-action.
root.addEventListener('click', (event) => {
  const el = event.target.closest('[data-action]')
  const name = location.hash.slice(1) in screens ? location.hash.slice(1) : 'now'
  screens[name].actions[el?.dataset.action]?.(app, el)
})

window.addEventListener('hashchange', app.render)
// Coming back to the app: the timer may have ended and midnight may have passed.
document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && app.render())

app.render()
