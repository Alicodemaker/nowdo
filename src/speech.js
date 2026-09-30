// Browser speech-to-text for the Brain dump. Not every browser has it, and
// most need internet for it, so callers always keep typing as the fallback.

const Recognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition

export const canListen = Boolean(Recognition)

// Add one finished phrase to the phrases heard so far. Android's Chrome engine
// reports every growing version of a sentence as finished ("so", "so I",
// "so I need"…), so a phrase that just extends the last one replaces it.
export function mergePhrase(phrases, phrase) {
  const next = phrase.trim()
  if (!next) return phrases
  const last = phrases.at(-1)
  if (last && next.toLowerCase().startsWith(last.toLowerCase())) return [...phrases.slice(0, -1), next]
  return [...phrases, next]
}

// Start listening. onText gets everything heard in this session so far (it
// replaces the previous onText), onInterim the phrase still being spoken.
// Returns a function that stops listening.
export function listen({ onText, onInterim, onError, onEnd }) {
  let phrases = []
  const recognition = new Recognition()
  recognition.lang = 'en-GB'
  recognition.continuous = true
  recognition.interimResults = true
  recognition.onresult = (event) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const phrase = event.results[i][0].transcript
      if (event.results[i].isFinal) phrases = mergePhrase(phrases, phrase)
      else interim += phrase
    }
    onText(phrases.join(' '))
    onInterim(interim)
  }
  recognition.onerror = (event) => onError(event.error)
  recognition.onend = onEnd
  recognition.start()
  return () => recognition.stop()
}
