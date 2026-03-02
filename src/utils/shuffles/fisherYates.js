import { maybeReverse } from './reversal.js'

const REVERSAL_PROBABILITY = 0.5

export const fisherYates = (deck, reversalMode = false) => {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  if (!reversalMode) return shuffled
  return shuffled.map((wrapper) => maybeReverse(wrapper, REVERSAL_PROBABILITY))
}
