import { maybeReverse } from './reversal.js'

const REVERSAL_PROBABILITY = 0.1

export const cut = (deck, reversalMode = false) => {
  const cutPoint = Math.floor(deck.length * (0.3 + Math.random() * 0.4))
  const result = [...deck.slice(cutPoint), ...deck.slice(0, cutPoint)]
  if (!reversalMode) return result
  return result.map((card) => maybeReverse(card, REVERSAL_PROBABILITY))
}
