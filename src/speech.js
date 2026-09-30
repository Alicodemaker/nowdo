// Browser speech-to-text for the Brain dump. Not every browser has it, and
// most need internet for it, so callers always keep typing as the fallback.

const Recognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition

export const canListen = Boolean(Recognition)

// Start listening. Finished phrases go to onText, the phrase still being
// spoken goes to onInterim. Returns a function that stops listening.
export function listen({ onText, onInterim, onError, onEnd }) {
  const recognition = new Recognition()
  recognition.lang = 'en-GB'
  recognition.continuous = true
  recognition.interimResults = true
  recognition.onresult = (event) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const phrase = event.results[i][0].transcript
      if (event.results[i].isFinal) onText(phrase)
      else interim += phrase
    }
    onInterim(interim)
  }
  recognition.onerror = (event) => onError(event.error)
  recognition.onend = onEnd
  recognition.start()
  return () => recognition.stop()
}
