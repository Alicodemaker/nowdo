// Claude, called straight from the phone with the person's own key (ADR 0002).
// Every caller has an offline fallback; these functions throw ClaudeError
// with a message that's safe to show when anything goes wrong.

const MODEL = 'claude-sonnet-5-5'
const KEY_STORAGE = 'do-now-claude-key'

export function getKey() {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? ''
  } catch {
    return ''
  }
}

export function setKey(key) {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key)
    else localStorage.removeItem(KEY_STORAGE)
  } catch {
    // Storage blocked: the app keeps working without Claude.
  }
}

export const canUseClaude = () => Boolean(getKey()) && navigator.onLine

export class ClaudeError extends Error {}

// One request with a JSON-shaped answer. The SDK is loaded only when needed,
// so the offline app never waits for it.
async function ask({ system, prompt, schema }) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic({ apiKey: getKey(), dangerouslyAllowBrowser: true, maxRetries: 1, timeout: 30_000 })
  let response
  try {
    response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      // If Claude declines, the API retries on its recommended fallback model.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: { type: 'json_schema', schema } },
      system,
      messages: [{ role: 'user', content: prompt }],
    })
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
      throw new ClaudeError('Your Claude key didn’t work. Check it in Settings.')
    }
    if (error instanceof Anthropic.RateLimitError) throw new ClaudeError('Claude is busy right now. Try again in a minute.')
    if (error instanceof Anthropic.APIConnectionError) throw new ClaudeError('Couldn’t reach Claude. Check your connection.')
    throw new ClaudeError('Claude couldn’t help this time.')
  }
  const text = response.content.find((block) => block.type === 'text')?.text
  if (response.stop_reason !== 'end_turn' || !text) throw new ClaudeError('Claude couldn’t help this time.')
  try {
    return JSON.parse(text)
  } catch {
    throw new ClaudeError('Claude couldn’t help this time.')
  }
}

const STEPS_SYSTEM = `You turn a messy brain dump about a project into tiny next steps for someone with ADHD who finds starting hard.
Each step is one concrete physical action that takes under 10 minutes and starts with a verb, like "Open the tax website" or "Find last year's letter".
Keep the person's own specifics (names, websites, places, people). Leave out feelings, worries and filler.
Put the steps in the order they should be done, and make the first one the easiest. Usually 3 to 8 steps.
Write in the same language the person used.`

export async function stepsFromBrainDump(projectName, dump) {
  const { steps } = await ask({
    system: STEPS_SYSTEM,
    prompt: `Project: ${projectName}\n\nBrain dump:\n${dump}`,
    schema: {
      type: 'object',
      properties: { steps: { type: 'array', items: { type: 'string' } } },
      required: ['steps'],
      additionalProperties: false,
    },
  })
  return steps
}

const MOVE_SYSTEM = `Someone with ADHD is stuck on a step. Suggest the single tiniest physical movement that gets it started, something that takes under two minutes, like "Open your laptop and go to skat.dk".
At most 10 words, starting with a verb. Write in the same language as the step.`

export async function tinyFirstMove(step, projectName) {
  const { move } = await ask({
    system: MOVE_SYSTEM,
    prompt: `Project: ${projectName}\nStep: ${step}`,
    schema: {
      type: 'object',
      properties: { move: { type: 'string' } },
      required: ['move'],
      additionalProperties: false,
    },
  })
  return move
}
