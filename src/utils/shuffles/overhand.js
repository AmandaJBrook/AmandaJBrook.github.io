import { maybeReverse } from './reversal.js'

const REVERSAL_PROBABILITY = 0.25

export const overhand = (deck, reversalMode = false) => {
  const shuffled = []
  let remaining = [...deck]

  while (remaining.length) {
    const chunkSize = Math.floor(Math.random() * 5) + 1
    const chunk = remaining.splice(0, chunkSize)
    shuffled.unshift(...chunk)
  }

  if (!reversalMode) return shuffled
  return shuffled.map((card) => maybeReverse(card, REVERSAL_PROBABILITY))
}
