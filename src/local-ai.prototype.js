// PROTOTYPE, throwaway (branch prototype/local-ai, never merge).
// Runs a small model in the browser with WebLLM (WebGPU) and compares its
// Brain dump steps with the app's offline splitter. No persistence, no polish.
import './theme.css'
import './base.css'
import './ui.css'
import './local-ai.prototype.css'
import { CreateMLCEngine } from '@mlc-ai/web-llm'
import { splitBrainDump } from './braindump.js'

const $ = (id) => document.getElementById(id)
let engine = null
let loadedModel = ''

// Same instructions the Claude version uses, so the comparison is fair.
const STEPS_SYSTEM = `You turn a messy brain dump about a project into tiny next steps for someone with ADHD who finds starting hard.
Each step is one concrete physical action that takes under 10 minutes and starts with a verb, like "Open the tax website" or "Find last year's letter".
Keep the person's own specifics (names, websites, places, people). Leave out feelings, worries and filler.
Put the steps in the order they should be done, and make the first one the easiest. Usually 3 to 8 steps.
Answer only with JSON like {"steps": ["...", "..."]}.`

const MOVE_SYSTEM = `Someone with ADHD is stuck on a step. Suggest the single tiniest physical movement that gets it started, something that takes under two minutes, like "Open your laptop and go to skat.dk".
At most 10 words, starting with a verb. Answer only with JSON like {"move": "..."}.`

const list = (el, items) => {
  el.replaceChildren(
    ...(items.length ? items : ['(nothing)']).map((text) => Object.assign(document.createElement('li'), { textContent: text })),
  )
}

// 1. What this phone offers
async function showFacts() {
  const facts = [['WebGPU', navigator.gpu ? 'yes' : 'no, so the model cannot run in this browser']]
  if (navigator.gpu) {
    const adapter = await navigator.gpu.requestAdapter().catch(() => null)
    facts.push(['Graphics chip found', adapter ? 'yes' : 'no'])
  }
  facts.push(['Memory hint', navigator.deviceMemory ? `${navigator.deviceMemory} GB or more` : 'not reported'])
  facts.push(['Browser', navigator.userAgent.replace(/^Mozilla\/5.0 /, '')])
  $('facts').replaceChildren(
    ...facts.flatMap(([k, v]) => [
      Object.assign(document.createElement('dt'), { textContent: k }),
      Object.assign(document.createElement('dd'), { textContent: v }),
    ]),
  )
  list($('split-steps'), splitBrainDump($('dump').value))
}

// 2. Download and load
$('load').addEventListener('click', async () => {
  const model = $('model').value
  const started = performance.now()
  $('load').disabled = true
  $('progress').hidden = false
  const onProgress = (report) => {
    $('progress').value = report.progress
    $('load-status').textContent = report.text
  }
  try {
    if (engine) await engine.reload(model)
    else engine = await CreateMLCEngine(model, { initProgressCallback: onProgress })
    loadedModel = model
    const seconds = ((performance.now() - started) / 1000).toFixed(0)
    $('load-status').textContent = `Loaded ${model} in ${seconds} s.`
    $('run-steps').disabled = false
    $('run-move').disabled = false
    list($('ai-steps'), ['Ready. Tap "Turn into steps".'])
  } catch (error) {
    $('load-status').textContent = `Couldn't load the model: ${error.message}`
  } finally {
    $('load').disabled = false
    $('progress').hidden = true
  }
})

async function ask(system, prompt, schema) {
  const started = performance.now()
  const reply = await engine.chat.completions.create({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 400,
    response_format: { type: 'json_object', schema: JSON.stringify(schema) },
  })
  const text = reply.choices[0].message.content ?? ''
  return { text, seconds: ((performance.now() - started) / 1000).toFixed(1) }
}

// 3. Brain dump to steps, side by side with the offline splitter
$('run-steps').addEventListener('click', async () => {
  $('run-steps').disabled = true
  list($('ai-steps'), ['Thinking…'])
  list($('split-steps'), splitBrainDump($('dump').value))
  try {
    const schema = {
      type: 'object',
      properties: { steps: { type: 'array', items: { type: 'string' } } },
      required: ['steps'],
    }
    const { text, seconds } = await ask(STEPS_SYSTEM, `Project: ${$('project').value}\n\nBrain dump:\n${$('dump').value}`, schema)
    $('raw').textContent = text
    $('ai-time').textContent = `${seconds} s, ${loadedModel.split('-Instruct')[0]}`
    let steps
    try {
      steps = JSON.parse(text).steps ?? []
    } catch {
      steps = [`The model's answer wasn't valid JSON. See the raw answer below.`]
    }
    list($('ai-steps'), steps)
  } catch (error) {
    list($('ai-steps'), [`Failed: ${error.message}`])
  } finally {
    $('run-steps').disabled = false
  }
})

// 4. One tiny first move
$('run-move').addEventListener('click', async () => {
  $('run-move').disabled = true
  $('move-result').textContent = 'Thinking…'
  try {
    const schema = { type: 'object', properties: { move: { type: 'string' } }, required: ['move'] }
    const { text, seconds } = await ask(MOVE_SYSTEM, `Step: ${$('step').value}`, schema)
    let move
    try {
      move = JSON.parse(text).move
    } catch {
      move = text
    }
    $('move-result').textContent = `${move} (${seconds} s)`
  } catch (error) {
    $('move-result').textContent = `Failed: ${error.message}`
  } finally {
    $('run-move').disabled = false
  }
})

$('dump').addEventListener('input', () => list($('split-steps'), splitBrainDump($('dump').value)))
showFacts()
