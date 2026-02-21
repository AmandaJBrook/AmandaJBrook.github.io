import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCurrentDeckStore = defineStore('currentDeck', () => {
  const currentDeck = ref(null)

  function setCurrentDeck(deck) {
    currentDeck.value = deck
  }

  return { currentDeck, setCurrentDeck }
})
