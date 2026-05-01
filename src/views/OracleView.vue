<script setup lang="ts">
import { ref } from 'vue'
import MainNav from '../components/MainNav.vue'
import OracleNav from '../components/OracleNav.vue'
import OracleCard from '../components/OracleCard.vue'
import { useCurrentDeckStore } from '../stores/currentDeck'
import { spreads, CARD_HALF_W, CARD_HALF_H } from '../data/spreads'
import type { CardWrapper, DragEndPayload, SpreadName } from '../types/oracle'

const store = useCurrentDeckStore()

// ─── Element refs ─────────────────────────────────────────────
// Both refs are typed as HTMLElement | null because they are null
// until Vue mounts the DOM. Any function that reads these must
// null-check before use — TypeScript enforces this.

// play-area: the droppable canvas where placed cards live.
// Passed to placed OracleCards as the neodrag bounds element.
// Also used to convert normalized spread coords to real pixels.
const playAreaRef = ref<HTMLElement | null>(null)

// deck-area: the draw pile container.
// Used in onDeckDragEnd to get the deck's screen position,
// which is needed to convert neodrag's offset coords to viewport coords.
const deckAreaRef = ref<HTMLElement | null>(null)

// ─── Flip handler ─────────────────────────────────────────────
// Called when a placed card is clicked (not dragged).
// flipCard toggles wrapper.faceDown, selectCard opens the detail panel.
function handleFlip(wrapper: CardWrapper): void {
  store.flipCard(wrapper)
  store.selectCard(wrapper)
}

// ─── Deck drag handler ────────────────────────────────────────
// Called when the top deck card is released after a drag.
//
// neodrag's offsetX/offsetY are relative to where the drag started
// (the deck-area), not the viewport. To determine whether the drop
// landed inside the play-area, we need absolute viewport coordinates.
//
// Coordinate conversion:
//   absX = deckArea.left + offsetX   → viewport X of the drop point
//   absY = deckArea.top  + offsetY   → viewport Y of the drop point
//
// If the drop is inside the play-area:
//   store position as (absX - playArea.left, absY - playArea.top)
//   so the card renders at the correct spot within play-area coords.
//
// If the drop is outside, reset the wrapper's position to (0,0)
// so the next OracleCard mount (triggered by :key change) starts
// flush inside deck-area.

function onDeckDragEnd({ wrapper, x, y }: DragEndPayload): void {
  const playArea = playAreaRef.value
  const deckArea = deckAreaRef.value
  if (!playArea || !deckArea) return

  const playRect = playArea.getBoundingClientRect()
  const deckRect = deckArea.getBoundingClientRect()

  const absX = deckRect.left + x
  const absY = deckRect.top + y

  const inPlayArea =
    absX >= playRect.left &&
    absX <= playRect.right &&
    absY >= playRect.top &&
    absY <= playRect.bottom

  if (inPlayArea) {
    // Convert viewport coords to play-area-relative coords and place the card.
    store.updateCardPosition(wrapper, absX - playRect.left, absY - playRect.top)
    store.currentDeck.placeCard(wrapper)

    // Reset the next top card's position to (0,0). This is necessary because
    // the deck card's OracleCard instance is destroyed and recreated when
    // :key changes (the new top card gets a fresh neodrag instance).
    // Without this reset, neodrag would mount the new card at stale coords.
    const nextCard = store.currentDeck.cards[store.currentDeck.cards.length - 1]
    if (nextCard) store.updateCardPosition(nextCard, 0, 0)
  } else {
    store.updateCardPosition(wrapper, 0, 0)
  }
}

// ─── Spread deal handler ──────────────────────────────────────
// Called by OracleNav when the user selects a named spread.
//
// Spread positions in spreads.ts are normalized (0.0–1.0).
// We multiply by the play-area's real pixel dimensions here
// so the layout is always centered correctly regardless of screen size.
//
// CARD_HALF_W and CARD_HALF_H offset each position so the card's
// center lands on the intended point, not its top-left corner.
//
// store.placeFromSpread() sets position, label, and rotation on
// the wrapper atomically before moving it to placedCards[].

function handleDealSpread(spreadName: SpreadName): void {
  const playArea = playAreaRef.value
  if (!playArea) return

  const { width, height } = playArea.getBoundingClientRect()
  const positions = spreads[spreadName]

  positions.forEach((pos) => {
    const wrapper = store.currentDeck.cards[store.currentDeck.cards.length - 1]
    if (!wrapper) return

    const pixelX = pos.x * width - CARD_HALF_W
    const pixelY = pos.y * height - CARD_HALF_H

    store.placeFromSpread(wrapper, pos, pixelX, pixelY)
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
      <!-- Play area: the canvas where cards are placed.
           ref is passed to placed OracleCards as their drag boundary. -->
      <section class="play-area" ref="playAreaRef">
        <OracleCard
          v-for="wrapper in store.currentDeck.placedCards"
          :key="wrapper.card.title"
          :wrapper="wrapper"
          :bounds="playAreaRef"
          @flip="handleFlip"
          @drag-end="({ wrapper, x, y }: DragEndPayload) => store.updateCardPosition(wrapper, x, y)"
        />
      </section>

      <!-- Deck area: shows the back of the top card in the draw pile.
           The card is keyed by title so Vue remounts OracleCard
           (and resets neodrag's internal state) each time the top card changes. -->
      <section
        class="deck-area"
        ref="deckAreaRef"
        :class="{ hidden: !store.currentDeck.cards.length }"
      >
        <OracleCard
          v-if="store.currentDeck.cards.length"
          :key="store.currentDeck.cards[store.currentDeck.cards.length - 1].card.title"
          :wrapper="store.currentDeck.cards[store.currentDeck.cards.length - 1]"
          :draggable="true"
          :in-deck="true"
          @drag-end="onDeckDragEnd"
        />
      </section>

      <!-- Card detail panel — shown when a placed card is clicked.
           Displays the card's reading text and position label if set. -->
      <section class="card-selection" v-if="store.selectedCard">
        <h2>{{ store.selectedCard.card.title.toUpperCase() }}</h2>
        <h3 v-if="store.selectedCard.label">{{ store.selectedCard.label.toUpperCase() }}</h3>
        <h3 v-else>{{ store.selectedCard.card.subtitle.toUpperCase() }}</h3>
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
