// The offline Brain dump splitter: turns typed lines or a spoken ramble into
// Step texts. Used when Claude isn't available (ADR 0002).

const SENTENCE_END = /(?<=[.!?])\s+/
const CONNECTOR = /\s*,?\s*\b(?:and then|after that|and also|then)\b\s*/i
const LEADING_FILLER =
  /^(?:so|um+|uh+|okay|ok|like|well|and|also|first|i need to|i have to|i should|i gotta|i must|i want to)\b[\s,]*/i
const TRAILING_PUNCTUATION = /[\s.!?,;]+$/

function tidy(chunk) {
  let text = chunk.replace(TRAILING_PUNCTUATION, '').trim()
  let before
  do {
    before = text
    text = text.replace(LEADING_FILLER, '')
  } while (text !== before)
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function splitBrainDump(text) {
  return (text ?? '')
    .split(/\n+/)
    .flatMap((line) => line.split(SENTENCE_END))
    .flatMap((sentence) => sentence.split(CONNECTOR))
    .map(tidy)
    .filter(Boolean)
}
