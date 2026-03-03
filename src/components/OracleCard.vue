<script setup>
import { vDraggable } from '@neodrag/vue'
import { ref } from 'vue'

const props = defineProps({
  wrapper: { type: Object, required: true },
  draggable: { type: Boolean, default: true },
})

const emit = defineEmits(['flip', 'drag-end'])
const isDragging = ref(false)

const draggableOptions = {
  disabled: !props.draggable,
  defaultPosition: props.wrapper.position,
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
</script>

<template>
  <div
    v-draggable="draggableOptions"
    class="oracle-card"
    :class="{ reversed: wrapper.reversed, flipped: wrapper.flipped, dragging: isDragging }"
    @click="handleClick"
  >
    <div class="card-inner">
      <div class="card-face card-front">
        <div class="card-image-frame">
          <img :src="wrapper.card.link" :alt="wrapper.card.title" />
        </div>
        <div class="card-text-frame">
          <p class="card-title">{{ wrapper.card.title.toUpperCase() }}</p>
          <p class="card-subtitle">{{ wrapper.card.subtitle.toUpperCase() }}</p>
        </div>
      </div>
      <div class="card-face card-back">
        <!-- card back image goes here -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.oracle-card {
  width: 199px;
  height: 285px;
  cursor: grab;
  perspective: 1000px;
  position: absolute;
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

/* flipped state — note this rotates the inner, not the card,
   so reversed (upside down) and flipped (face up) are independent */
.oracle-card.flipped .card-inner {
  transform: rotateY(180deg);
}

.oracle-card.reversed .card-inner {
  transform: rotateX(180deg);
}

.oracle-card.flipped.reversed .card-inner {
  transform: rotateY(180deg) rotateX(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}

.card-image-frame {
  width: 159px;
  height: 208px;
  margin: 20px auto 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.card-text-frame {
  width: 159px;
  height: 37px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-size: 1.4rem;
  margin: 0;
  line-height: 1;
}

.card-subtitle {
  font-size: 0.85rem;
  margin: 0;
  line-height: 1;
}
</style>
