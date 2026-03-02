import { ref } from 'vue'
import { defineStore } from 'pinia'
import Deck from '@/classes/Deck'
import oracleArray from '@/data/oracle-cards.js'
import { fisherYates, riffle, overhand, cut } from '@/utils/shuffles/index.js'

const shufflers = { riffle, overhand, 'fisher-yates': fisherYates, cut }

export const useCurrentDeckStore = defineStore('currentDeck', () => {
  const currentDeck = ref(new Deck('oracle', oracleArray))
  const selectedCard = ref(null)
  const reversalMode = ref(false)
  const lastAlgorithm = ref('fisher-yates')

  function setDeck(name, cardsArray) {
    currentDeck.value = new Deck(name, cardsArray)
  }

  function shuffle(algorithm) {
    lastAlgorithm.value = algorithm
    currentDeck.value.cards = shufflers[algorithm](currentDeck.value.cards, reversalMode.value)
    currentDeck.value.recordShuffle(algorithm)
  }

  function clearTable() {
    currentDeck.value.clearTable()
  }

  function reset() {
    clearTable()
    const freshWrappers = currentDeck.value.originalOrder.map((card) => ({
      card,
      reversed: false,
      placedAt: null,
    }))
    currentDeck.value.reset(shufflers[lastAlgorithm.value](freshWrappers, reversalMode.value))
  }

  function selectCard(wrapper) {
    selectedCard.value = wrapper
  }

  function clearSelection() {
    selectedCard.value = null
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
  }
})
