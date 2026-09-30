// PROTOTYPE, throwaway (branch prototype/local-ai, never merge).
// Compares three ways of turning browser speech recognition into text, and
// logs every raw event, to find why Android repeats words in the Brain dump.
import './theme.css'
import './base.css'
import './ui.css'
import './projects.css'
import './local-ai.prototype.css'

const Recognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition
const $ = (id) => document.getElementById(id)

let recognition = null
let listening = false // true from tap-to-start until tap-to-stop
let text = '' // everything heard so far
let committed = '' // mode B: text before the phrase that may still grow
let lastPhrase = '' // mode B: the phrase that may still grow
const logLines = []

const mode = () => document.querySelector('input[name="mode"]:checked').value

function log(line) {
  const time = new Date().toLocaleTimeString('en-GB', { hour12: false })
  logLines.push(`${time} ${line}`)
  $('log').textContent = logLines.slice(-200).join('\n')
}

function show() {
  $('text').textContent = text || '(nothing yet)'
  const words = text.split(/\s+/).filter(Boolean).length
  $('count').textContent = `${words} words`
  $('mic').setAttribute('aria-pressed', String(listening))
  $('mic-zone').classList.toggle('is-listening', listening)
  $('mic-label').textContent = listening ? 'Stop listening' : 'Start listening'
  if (!Recognition) $('mic-hint').textContent = 'This browser has no speech recognition.'
  else $('mic-hint').textContent = listening ? `Listening in way ${mode()}… tap to stop.` : 'Tap to talk.'
}

// How each way of listening handles one finished phrase.
function addFinal(phrase) {
  const p = phrase.trim()
  if (!p) return
  if (mode() === 'B') {
    // Android sends "so", "so I", "so I need"… as separate finished phrases.
    // If the new phrase just extends the last one, replace it instead of adding.
    if (lastPhrase && p.toLowerCase().startsWith(lastPhrase.toLowerCase())) {
      lastPhrase = p
    } else {
      committed = `${committed} ${lastPhrase}`.trim()
      lastPhrase = p
    }
    text = `${committed} ${lastPhrase}`.trim()
  } else {
    text = `${text} ${p}`.trim()
  }
}

function start() {
  const r = new Recognition()
  r.lang = $('lang').value
  r.interimResults = true
  r.continuous = mode() !== 'C'
  r.onresult = (event) => {
    const all = [...event.results].map((res, i) => `[${i}${res.isFinal ? ' final' : ''}] "${res[0].transcript}"`)
    log(`result from=${event.resultIndex} count=${event.results.length} ${all.join(' ')}`)
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) addFinal(event.results[i][0].transcript)
      else interim += event.results[i][0].transcript
    }
    $('interim').textContent = interim ? `Hearing: ${interim}` : ''
    show()
  }
  r.onerror = (event) => log(`error ${event.error}`)
  r.onend = () => {
    log('end')
    $('interim').textContent = ''
    if (listening && mode() === 'C') return start() // quietly listen for the next phrase
    listening = false
    show()
  }
  // A new session: in mode B, a phrase from the old session never grows again.
  committed = text
  lastPhrase = ''
  r.start()
  recognition = r
  log(`start way=${mode()} lang=${r.lang} continuous=${r.continuous}`)
}

$('mic').addEventListener('click', () => {
  if (!Recognition) return
  if (listening) {
    listening = false
    recognition?.stop()
    log('stop tapped')
  } else {
    listening = true
    start()
  }
  show()
})

$('clear').addEventListener('click', () => {
  text = committed = lastPhrase = ''
  logLines.length = 0
  $('log').textContent = ''
  show()
})

$('copy').addEventListener('click', async () => {
  const report = [`Browser: ${navigator.userAgent}`, `Text: ${text}`, ...logLines].join('\n')
  try {
    await navigator.clipboard.writeText(report)
    $('copy').textContent = 'Copied'
  } catch {
    // Clipboard blocked: select the log so it can be copied by hand.
    getSelection().selectAllChildren($('log'))
    $('copy').textContent = 'Select and copy the log below'
  }
  setTimeout(() => ($('copy').textContent = 'Copy log'), 2000)
})

document.querySelectorAll('input[name="mode"]').forEach((input) => input.addEventListener('change', show))
log(`page loaded, speech recognition ${Recognition ? 'available' : 'missing'}`)
show()
