class Deck {
  constructor(name, cards) {
    this.name = name
    this.originalOrder = [...cards]
    this.cards = cards.map((card) => ({
      card,
      reversed: false,
      flipped: false,
      placedAt: null,
      position: { x: 0, y: 0 },
    }))
    this.placedCards = []
    this.shuffleHistory = []
  }

  recordShuffle(algorithm) {
    this.shuffleHistory.push({
      algorithm,
      timestamp: new Date().toISOString(),
    })
  }

  placeCard(wrapper) {
    this.cards = this.cards.filter((w) => w !== wrapper)
    this.placedCards.push(wrapper)
  }

  returnCard(wrapper) {
    this.placedCards = this.placedCards.filter((w) => w !== wrapper)
    this.cards.push(wrapper)
  }

  clearTable() {
    this.placedCards.forEach((w) => (w.reversed = false))
    this.cards = [...this.cards, ...this.placedCards]
    this.placedCards = []
  }

  reset(reshuffledCards) {
    this.cards = reshuffledCards
    this.placedCards = []
  }
}

export default Deck
