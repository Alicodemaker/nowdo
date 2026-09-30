import './theme.css'
import './base.css'
import './now.css'

// Kickoff sample only: press Start to see the 2-minute ring run.
// The real app replaces this during the v1 build.
const zone = document.querySelector('.start-zone')
const start = document.querySelector('.start')
const hint = document.querySelector('.start-hint')

start?.addEventListener('click', () => {
  const running = zone.classList.toggle('is-running')
  start.textContent = running ? 'Going' : 'Start'
  hint.textContent = running ? 'You started. That was the hard part.' : 'Just 2 minutes.'
})
