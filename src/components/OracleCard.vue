<script setup>
import { vDraggable } from '@neodrag/vue'
import { ref } from 'vue'

const props = defineProps({
  wrapper: { type: Object, required: true },
  draggable: { type: Boolean, default: true },
  inDeck: { type: Boolean, default: false },
})

const emit = defineEmits(['flip', 'drag-end'])
const isDragging = ref(false)

const draggableOptions = {
  disabled: !props.draggable,
  defaultPosition: props.inDeck ? { x: 0, y: 0 } : props.wrapper.position,
  onDrag: () => {
    isDragging.value = true
  },
  onDragEnd: ({ offsetX, offsetY }) => {
    isDragging.value = false
    emit('drag-end', { wrapper: props.wrapper, x: offsetX, y: offsetY })
  },
}
const handleClick = () => {
  if (!isDragging.value) {
    emit('flip', props.wrapper)
  }
}

const imageLoaded = ref(true)
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
          :src="'/images/oracle-cards/back.png'"
          alt="Card Back"
          :draggable="false"
          :style="{ opacity: imageLoaded ? 1 : 0 }"
          @load="imageLoaded = true"
        />
      </div>
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
   and neodrag translates from (0,0) rather than escaping to oracle-main */
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

/* Front is hidden by default — revealed when .faceDown rotates card-inner */
.card-face.card-front {
  background-color: black;
  border-radius: 10px;
  transform: none;
}

/* Back is visible by default — no transform needed */
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

/* Scale trick to bypass browser minimum font size */
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
</style>
