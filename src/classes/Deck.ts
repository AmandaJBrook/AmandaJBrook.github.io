// Manages the two card arrays that represent the game state:
//   cards[]       — the draw pile (unplaced cards, top = last index)
//   placedCards[] — cards on the table, in placement order
//
// Wrappers are created once in the constructor and mutated
// throughout the game. They are never recreated — the same
// object reference moves between cards[] and placedCards[].
// This is important for Vue's reactivity: components hold refs
// to wrapper objects, so mutation is seen automatically.
// ─────────────────────────────────────────────────────────────

import type { OracleCardData, CardWrapper, ShuffleAlgorithm } from '../types/oracle'

class Deck {
  name: string
  originalOrder: OracleCardData[]
  cards: CardWrapper[]
  placedCards: CardWrapper[]
  shuffleHistory: { algorithm: ShuffleAlgorithm; timestamp: string }[]

  constructor(name: string, cards: OracleCardData[]) {
    this.name = name

    // Keep the original card order so reset() can restore it
    this.originalOrder = [...cards]

    // Wrap every raw card in a CardWrapper with default game state.
    // position starts at { x: 0, y: 0 } — neodrag reads this as
    // defaultPosition when the card's OracleCard component mounts.
    // label and rotation are left undefined — they are only set
    // by store.placeFromSpread() when dealing a named spread.
    this.cards = cards.map((card) => ({
      card,
      faceDown: true,
      reversed: false,
      position: { x: 0, y: 0 },
    }))

    this.placedCards = []
    this.shuffleHistory = []
  }

  // Records which shuffle algorithm was used and when.
  // Called by the store's shuffle() action after reordering cards[].
  recordShuffle(algorithm: ShuffleAlgorithm): void {
    this.shuffleHistory.push({
      algorithm,
      timestamp: new Date().toISOString(),
    })
  }

  // Moves the top card (last index) from the draw pile to the table.
  // The wrapper's position, label, and rotation should be set on the
  // wrapper BEFORE calling placeCard(), so the card arrives at the
  // correct position when placedCards[] re-renders in OracleView.
  placeCard(wrapper: CardWrapper): void {
    this.cards = this.cards.filter((w) => w !== wrapper)
    this.placedCards.push(wrapper)
  }

  // Returns a placed card to the bottom of the draw pile.
  // Clears its label and rotation so it behaves like an unplaced card.
  returnCard(wrapper: CardWrapper): void {
    this.placedCards = this.placedCards.filter((w) => w !== wrapper)
    wrapper.label = undefined
    wrapper.rotation = undefined
    this.cards.push(wrapper)
  }

  // Resets all placed cards to face-down, unrotated, unlabeled,
  // and moves them back to the draw pile. Does not reshuffle —
  // call store.reset() for a full reshuffle.
  clearTable(): void {
    this.placedCards.forEach((w) => {
      w.faceDown = true
      w.reversed = false
      w.rotation = undefined
      w.label = undefined
      w.position = { x: 0, y: 0 }
    })
    this.cards = [...this.cards, ...this.placedCards]
    this.placedCards = []
  }

  // Replaces cards[] with a reshuffled set and clears the table.
  // Called by store.reset() which builds reshuffledCards from
  // originalOrder before passing it here.
  reset(reshuffledCards: CardWrapper[]): void {
    this.cards = reshuffledCards
    this.placedCards = []
  }
}

export default Deck
