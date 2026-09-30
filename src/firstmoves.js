// Built-in first moves for "Make it smaller": the tiniest physical action
// that gets a Step going. Keyword matches come first, then the always-there
// moves fill the list up to 4.

const BY_KEYWORD = [
  [/\b(e-?mails?|mails?|inbox|reply|replies)\b/i, 'Open your inbox'],
  [/\b(pay|bills?|tax|taxes|bank|invoices?|skat)\b/i, 'Open the website or bank app login page'],
  [/\b(write|essay|report|draft|doc|document|letter|cv|application)\b/i, 'Open a blank doc and type the title'],
  [/\b(call|phone|ring)\b/i, 'Find the number and put it on screen'],
  [/\b(clean|tidy|dishes|laundry|vacuum|hoover)\b/i, 'Pick up one thing and put it away'],
  [/\b(read|study|revise|book|chapter)\b/i, 'Open it and read one line'],
  [/\b(buy|shop|shopping|order|groceries)\b/i, 'Open the shop app or write the list'],
  [/\b(cook|dinner|lunch|meal|bake)\b/i, 'Take one ingredient out'],
  [/\b(gym|run|walk|exercise|workout|train|training)\b/i, 'Put your shoes on'],
]

const ALWAYS = [
  'Open your PC',
  'Get what you need in front of you',
  'Clear a small space to work',
  'Stand up and go to where it happens',
]

export function firstMoves(stepText) {
  const matched = BY_KEYWORD.filter(([pattern]) => pattern.test(stepText)).map(([, move]) => move)
  return [...new Set([...matched, ...ALWAYS])].slice(0, 4)
}
