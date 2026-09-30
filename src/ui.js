// Small shared UI helpers: safe text, toasts, the done burst and vibration.

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ENTITIES[c])

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

export function buzz(pattern = 20) {
  navigator.vibrate?.(pattern)
}

const TOAST_MS = 5000
let toastTimer

// Show a short message with an optional action, e.g. { label: 'Undo', run }.
export function toast(message, action) {
  const region = document.querySelector('.toast-region')
  clearTimeout(toastTimer)
  region.innerHTML = `<div class="toast"><span>${esc(message)}</span>${
    action ? `<button class="toast-action" type="button">${esc(action.label)}</button>` : ''
  }</div>`
  region.querySelector('.toast-action')?.addEventListener('click', () => {
    region.innerHTML = ''
    action.run()
  })
  toastTimer = setTimeout(() => (region.innerHTML = ''), TOAST_MS)
}

const BURST_MS = 800

// Dots fly out from the middle of an element: the "done" moment.
export function burst(fromEl, count = 14) {
  if (!fromEl || reducedMotion()) return
  const box = fromEl.getBoundingClientRect()
  const layer = document.createElement('div')
  layer.className = 'burst'
  layer.setAttribute('aria-hidden', 'true')
  layer.style.left = `${box.left + box.width / 2}px`
  layer.style.top = `${box.top + box.height / 2}px`
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('span')
    dot.style.setProperty('--angle', `${(360 / count) * i}deg`)
    layer.append(dot)
  }
  document.body.append(layer)
  setTimeout(() => layer.remove(), BURST_MS)
}
