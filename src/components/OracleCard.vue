<script setup lang="ts">
import { vDraggable } from '@neodrag/vue'
import { ref, computed } from 'vue'
import type { CardWrapper, DragEndPayload } from '../types/oracle'

// ─── Props ────────────────────────────────────────────────────
// wrapper:   the CardWrapper object for this card (required)
// draggable: false for placed cards that should not be draggable
//            (reserved for future use — currently all cards drag)
// inDeck:    true when this card is the top of the draw pile.
//            Changes positioning from absolute (play-area) to
//            relative (inside deck-area) so neodrag starts at (0,0).
// bounds:    the play-area HTMLElement passed from OracleView.
//            Tells neodrag not to let this card leave that element.
//            Only passed for placed cards — deck card has no bounds
//            because its drop logic is handled manually in OracleView.

const props = withDefaults(
  defineProps<{
    wrapper: CardWrapper
    draggable?: boolean
    inDeck?: boolean
    bounds?: HTMLElement | null
  }>(),
  {
    draggable: true,
    inDeck: false,
    bounds: null,
  },
)

const emit = defineEmits<{
  flip: [wrapper: CardWrapper]
  'drag-end': [payload: DragEndPayload]
}>()

// ─── Drag state ───────────────────────────────────────────────
// isDragging prevents a click from firing at the end of a drag.
// Without this, releasing a drag would also trigger handleClick.
const isDragging = ref(false)

// ─── Neodrag options ──────────────────────────────────────────
// Computed so that reactive values (props.bounds, wrapper.position)
// are re-read on each render cycle rather than captured once at
// component creation. This is critical for bounds: playAreaRef in
// OracleView is null at setup time and resolves after mount —
// a plain object would always capture null.
const draggableOptions = computed(() => ({
  disabled: !props.draggable,

  // defaultPosition tells neodrag where to render the card on mount.
  // Deck card always starts at (0,0) inside deck-area.
  // Placed cards use the position stored on the wrapper, which was
  // set either by a manual drag or by store.placeFromSpread().
  defaultPosition: props.inDeck ? { x: 0, y: 0 } : props.wrapper.position,

  // bounds constrains dragging to the play-area element.
  // undefined (not null) tells neodrag to skip bounds checking.
  bounds: props.bounds ?? undefined,

  onDrag: () => {
    isDragging.value = true
  },

  onDragEnd: ({ offsetX, offsetY }: { offsetX: number; offsetY: number }) => {
    isDragging.value = false
    emit('drag-end', { wrapper: props.wrapper, x: offsetX, y: offsetY })
  },
}))

// ─── Click handler ────────────────────────────────────────────
// Only emits flip if the interaction was a click, not a drag release.
const handleClick = () => {
  if (!isDragging.value) {
    emit('flip', props.wrapper)
  }
}

// ─── Image load state ─────────────────────────────────────────
// Hides the card back image until it loads to avoid a flash of
// broken layout. The spinner shows in its place.
const imageLoaded = ref(true)

// ─── Rotation style ───────────────────────────────────────────
// Applied as an inline style when wrapper.rotation is set.
// Only used for specific spread positions (e.g. Celtic Cross Challenge).
// Manually dragged cards have rotation: undefined so no transform is applied.
const rotationStyle = computed(() =>
  props.wrapper.rotation != null ? { transform: `rotate(${props.wrapper.rotation}deg)` } : {},
)
</script>

<template>
  <div
    v-draggable="draggableOptions"
    class="oracle-card"
    :class="{
      reversed: wrapper.reversed,
      'face-down': wrapper.faceDown,
      dragging: isDragging,
      'in-deck': inDeck,
    }"
    :style="rotationStyle"
    @click="handleClick"
  >
    <div class="card-inner">
      <div class="card-face card-front">
        <div class="card-image-frame">
          <img :src="wrapper.card.link" :alt="wrapper.card.title" :draggable="!inDeck" />
        </div>
        <div class="card-text-frame">
          <h1 class="card-title">{{ wrapper.card.title.toUpperCase() }}</h1>
          <h2 class="card-subtitle">{{ wrapper.card.subtitle.toUpperCase() }}</h2>
        </div>
      </div>

      <div class="card-face card-back">
        <div v-if="!imageLoaded" class="card-loading">
          <span class="spinner" />
        </div>
        <img
          src="/images/oracle-cards/back.png"
          alt="Card Back"
          :draggable="false"
          :style="{ opacity: imageLoaded ? 1 : 0 }"
          @load="imageLoaded = true"
        />
      </div>
    </div>

    <!-- Spread position label — only shown for spread-dealt cards.
         Sits outside card-inner so it isn't affected by the flip transform. -->
    <div v-if="wrapper.label" class="card-label">
      {{ wrapper.label }}
    </div>
  </div>
</template>

<style scoped>
.oracle-card {
  width: 119px;
  height: 170px;
  cursor: grab;
  perspective: 1000px;
  position: absolute;
  border-radius: 10px;
}

/* When sitting in the deck, position relative so it stays inside deck-area
   and neodrag translates from (0,0) rather than escaping to oracle-main. */
.oracle-card.in-deck {
  position: relative;
  left: unset;
  top: unset;
}

.oracle-card.dragging {
  cursor: grabbing;
  z-index: 1000;
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s ease;
}

.oracle-card.face-down .card-inner {
  transform: rotateY(180deg);
}

.oracle-card.reversed .card-face.card-front {
  transform: rotateY(180deg) rotateX(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

/* Front is hidden by default — revealed when .faceDown rotates card-inner. */
.card-face.card-front {
  background-color: black;
  border-radius: 10px;
  transform: none;
}

/* Back is visible by default — no transform needed. */
.card-back {
  transform: rotateY(180deg);
}

.card-back img {
  width: 119px;
  height: 170px;
  border-radius: 10px;
}

.card-image-frame {
  width: 90px;
  height: 100px;
  margin: 20px auto 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.card-text-frame {
  width: 90px;
  min-width: 0;
  height: 50px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0 2px;
  box-sizing: border-box;
}

/* Scale trick to bypass browser minimum font size. */
.card-title {
  font-size: 12px;
  margin: 0;
  line-height: 0.5;
  text-align: center;
  white-space: nowrap;
  transform: scale(0.5);
  transform-origin: center center;
}

.card-subtitle {
  font-size: 12px;
  margin: 0;
  text-align: center;
  white-space: nowrap;
  transform: scale(0.35);
  transform-origin: center center;
}

/* Spread position label — appears below the card.
   Hidden for manually dragged cards (wrapper.label is undefined). */
.card-label {
  position: absolute;
  bottom: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  color: rgb(255 255 255 / 60%);
  white-space: nowrap;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  pointer-events: none;
}
</style>
