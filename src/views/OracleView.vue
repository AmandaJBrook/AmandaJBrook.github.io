<script setup lang="ts">
import MainNav from '../components/MainNav.vue'
import OracleNav from '../components/OracleNav.vue'
import OracleCard from '../components/OracleCard.vue'
import { ref } from 'vue'
import { useCurrentDeckStore } from '../stores/currentDeck'
import { spreads } from '../data/spreads'

const store = useCurrentDeckStore()
const playBoundary = ref(null)

// Called when a placed card is clicked.
// flipCard toggles wrapper.faceDown, selectCard updates the card-selection panel.
function handleFlip(wrapper) {
  store.flipCard(wrapper)
  store.selectCard(wrapper)
}

// Called when the top deck card is dragged.
// Only draws the card if it was dropped inside the play-area boundary.
// If dropped outside, neodrag resets the card visually since wrapper.position hasn't changed.
function onDeckDragEnd({ wrapper, x, y }) {
  const playArea = document.querySelector('.play-area')
  const deckArea = document.querySelector('.deck-area')
  const playRect = playArea.getBoundingClientRect()
  const deckRect = deckArea.getBoundingClientRect()

  // neodrag offsetX/Y are relative to the element's start position,
  // so we add the deck-area's screen position to get absolute coordinates.
  const absX = deckRect.left + x
  const absY = deckRect.top + y

  const inPlayArea =
    absX >= playRect.left &&
    absX <= playRect.right &&
    absY >= playRect.top &&
    absY <= playRect.bottom

  if (inPlayArea) {
    // Store position relative to play-area so the card renders at the drop point
    store.updateCardPosition(wrapper, absX - playRect.left, absY - playRect.top)
    store.currentDeck.placeCard(wrapper)

    // Zero out the next top card's position so neodrag renders it
    // flush inside deck-area and not at stale coordinates
    const nextCard = store.currentDeck.cards[store.currentDeck.cards.length - 1]
    if (nextCard) store.updateCardPosition(nextCard, 0, 0)
  } else {
    // If dropped outside play-area, reset position to deck-area via neodrag
    store.updateCardPosition(wrapper, 0, 0)
  }
}

function handleDealSpread(spreadName) {
  const positions = spreads[spreadName]
  positions.forEach((pos) => {
    const wrapper = store.currentDeck.cards[store.currentDeck.cards.length - 1]
    if (!wrapper) return
    store.updateCardPosition(wrapper, pos.x, pos.y)
    store.currentDeck.placeCard(wrapper)
  })
}
</script>

<template>
  <div class="oracle-body">
    <header>
      <MainNav
        :links="[
          { label: 'home', href: '/', type: 'router' },
          { label: 'oracle library', href: '/oracle-library', type: 'router' },
        ]"
      />
    </header>
    <main class="oracle-main">
      <section class="play-area" ref="playBoundary">
        <OracleCard
          v-for="wrapper in store.currentDeck.placedCards"
          :key="wrapper.card.title"
          :wrapper="wrapper"
          :bounds="playBoundary"
          @flip="handleFlip"
          @drag-end="({ wrapper, x, y }) => store.updateCardPosition(wrapper, x, y)"
        />
      </section>

      <section class="deck-area" :class="{ hidden: !store.currentDeck.cards.length }">
        <OracleCard
          v-if="store.currentDeck.cards.length"
          :key="store.currentDeck.cards[store.currentDeck.cards.length - 1].card.title"
          :wrapper="store.currentDeck.cards[store.currentDeck.cards.length - 1]"
          :draggable="true"
          :in-deck="true"
          @drag-end="onDeckDragEnd"
        />
      </section>

      <!-- Card detail panel — shown when a placed card is clicked -->
      <section class="card-selection" v-if="store.selectedCard">
        <h2>{{ store.selectedCard.card.title.toUpperCase() }}</h2>
        <h3>{{ store.selectedCard.card.subtitle.toUpperCase() }}</h3>
        <p>{{ store.selectedCard.card.description }}</p>
        <button @click="store.clearSelection">✕</button>
      </section>
    </main>
    <footer>
      <OracleNav
        @shuffle="store.shuffle"
        @clear-table="store.clearTable"
        @reset="store.reset"
        @toggle-reversal="store.reversalMode = !store.reversalMode"
        @deal-spread="handleDealSpread"
      />
    </footer>
  </div>
</template>

<style scoped>
.oracle-body {
  display: grid;
  position: fixed;
  grid-template-columns: 1fr;
  grid-template-areas: 'top' 'main' 'bottom';
  background-color: var(--dark);
  background-repeat: cover;
}

header {
  grid-area: top;
  height: 60px;
}

.oracle-main {
  grid-area: main;
  border: 1px solid #28c02d;
  display: block;
  position: relative;
  height: 85vh;
  width: 100vw;
  margin: auto;
}

.play-area {
  position: absolute;
  border-radius: 5px;
  top: 5%;
  left: 3%;
  width: 94%;
  height: 90%;
  border: 1px solid #7e28c0;
}

.deck-area {
  background-image: url('/images/oracle-cards/back.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  border-radius: 10px;
  bottom: 5%;
  left: 3%;
  width: 119px;
  height: 170px;
  z-index: 10;
}

.deck-area.hidden {
  display: none;
}

.card-selection {
  position: absolute;
  border-radius: 5px;
  bottom: 5%;
  right: 3%;
  width: clamp(200px, 20vw, 400px);
  height: 30%;
  border: 1px solid #b1c028;
  padding: 10px;
  box-sizing: border-box;
  overflow-y: auto;
  color: white;
}

.card-selection h2 {
  margin: 0 0 4px;
  font-size: 0.85rem;
}

.card-selection h3 {
  margin: 0 0 8px;
  font-size: 0.7rem;
  opacity: 0.7;
}

.card-selection p {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.4;
}

.card-selection button {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
}

footer {
  grid-area: bottom;
  height: 60px;
}
</style>
