// Pinia store — single source of truth for the active deck's
// game state. All mutations to wrappers go through here so
// that Vue's reactivity system sees every change.
//
// Key concepts:
//   currentDeck  — the Deck instance holding cards[] and placedCards[]
//   selectedCard — the wrapper currently shown in the detail panel
//   reversalMode — when true, shuffles may randomly reverse cards
//   lastAlgorithm— the most recently used shuffle, replayed on reset()
// ─────────────────────────────────────────────────────────────

import { ref } from 'vue'
import { defineStore } from 'pinia'
import Deck from '@/classes/Deck'
import oracleArray from '@/data/oracle-cards.js'
import { fisherYates, riffle, overhand, cut } from '@/utils/shuffles/index.js'
import type { CardWrapper, OracleCardData, SpreadPosition, ShuffleAlgorithm } from '@/types/oracle'

// Shuffle functions all share this signature: take the current card array
// and a reversalMode flag, return a reordered array of the same wrappers.
type ShufflerFn = (cards: CardWrapper[], reversalMode: boolean) => CardWrapper[]

// Maps ShuffleAlgorithm string keys to their implementation functions.
// To add a new algorithm: add the utility to shuffles/index.js,
// add its key to ShuffleAlgorithm in types/oracle.ts, then add it here.
const shufflers: Record<ShuffleAlgorithm, ShufflerFn> = {
  riffle,
  overhand,
  'fisher-yates': fisherYates,
  cut,
}

export const useCurrentDeckStore = defineStore('currentDeck', () => {
  const currentDeck = ref(new Deck('oracle', oracleArray))
  const selectedCard = ref<CardWrapper | null>(null)
  const reversalMode = ref(false)
  const lastAlgorithm = ref<ShuffleAlgorithm>('fisher-yates')

  // Replaces the active deck entirely. Used when switching between
  // different card sets (e.g. oracle library selection).
  function setDeck(name: string, cardsArray: OracleCardData[]): void {
    currentDeck.value = new Deck(name, cardsArray)
  }

  // Reorders cards[] using the given algorithm.
  // reversalMode is passed to the shuffler so it can randomly
  // mark wrappers as reversed during the shuffle.
  function shuffle(algorithm: ShuffleAlgorithm): void {
    lastAlgorithm.value = algorithm
    currentDeck.value.cards = shufflers[algorithm](currentDeck.value.cards, reversalMode.value)
    currentDeck.value.recordShuffle(algorithm)
  }

  // Moves all placed cards back to the draw pile, resetting their
  // visual state. Does not reshuffle the draw pile order.
  function clearTable(): void {
    currentDeck.value.clearTable()
  }

  // Full reset: clears the table, rebuilds wrappers from originalOrder,
  // then reshuffles using the last algorithm used. Reversals are reapplied
  // based on the current reversalMode setting.
  function reset(): void {
    clearTable()
    const freshWrappers = currentDeck.value.originalOrder.map((card) => ({
      card,
      faceDown: true,
      reversed: false,
      position: { x: 0, y: 0 },
    }))
    currentDeck.value.reset(shufflers[lastAlgorithm.value](freshWrappers, reversalMode.value))
  }

  // Sets the card shown in the detail panel (card-selection section).
  // Called by OracleView.handleFlip() when a placed card is clicked.
  function selectCard(wrapper: CardWrapper): void {
    selectedCard.value = wrapper
  }

  // Clears the detail panel.
  function clearSelection(): void {
    selectedCard.value = null
  }

  // Toggles the card between face-up and face-down.
  // Called by OracleView.handleFlip() alongside selectCard().
  function flipCard(wrapper: CardWrapper): void {
    wrapper.faceDown = !wrapper.faceDown
  }

  // Updates a wrapper's position in the play-area coordinate system.
  // x and y are pixels relative to the top-left of .play-area.
  // Called after a manual drag and after placeFromSpread().
  function updateCardPosition(wrapper: CardWrapper, x: number, y: number): void {
    wrapper.position = { x, y }
  }

  // Places a card from a named spread deal.
  // Unlike a manual drag (which calls updateCardPosition + placeCard separately),
  // this sets position, label, and rotation atomically before moving the wrapper
  // to placedCards[] — so the card arrives fully configured in one render cycle.
  //
  // pixelX and pixelY are already converted from normalized spread coords
  // to real pixels by OracleView.handleDealSpread() before this is called.
  function placeFromSpread(
    wrapper: CardWrapper,
    pos: SpreadPosition,
    pixelX: number,
    pixelY: number,
  ): void {
    wrapper.position = { x: pixelX, y: pixelY }
    wrapper.label = pos.label
    wrapper.rotation = pos.rotate ?? undefined
    currentDeck.value.placeCard(wrapper)
  }

  return {
    currentDeck,
    selectedCard,
    reversalMode,
    setDeck,
    shuffle,
    clearTable,
    reset,
    selectCard,
    clearSelection,
    flipCard,
    updateCardPosition,
    placeFromSpread,
  }
})
