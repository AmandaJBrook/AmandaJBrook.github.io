import { maybeReverse } from './reversal.js'

const REVERSAL_PROBABILITY = 0.4

export const riffle = (deck, reversalMode = false) => {
  const mid = Math.floor(deck.length / 2)
  const left = deck.slice(0, mid)
  const right = deck.slice(mid)
  const shuffled = []

  while (left.length && right.length) {
    if (Math.random() < 0.5) {
      shuffled.push(left.shift())
    } else {
      shuffled.push(right.shift())
    }
  }

  const result = [...shuffled, ...left, ...right]
  if (!reversalMode) return result
  return result.map((card) => maybeReverse(card, REVERSAL_PROBABILITY))
}
