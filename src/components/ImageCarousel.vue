<script setup lang="js">
import { ref, computed, watch } from 'vue'
import { Motion, AnimatePresence } from 'motion-v'

const props = defineProps({
  items: { type: Array, required: true },
  category: { type: String, required: true }, // 'painting' | 'design' | 'website'
})

// ─── State ────────────────────────────────────────────────────

const isModalOpen = ref(false)
const currentIndex = ref(0)
const zoom = ref(1)
const isDragging = ref(false)

// Accumulated pan position — updated on drag end
const pan = ref({ x: 0, y: 0 })
// Live pan delta during an active drag — added to pan on mouse up
const dragDelta = ref({ x: 0, y: 0 })
// Anchor point where the drag began
const dragStart = ref({ x: 0, y: 0 })

// Direction of the last navigation — drives the Motion slide direction.
// 'next' slides incoming image from right, 'prev' from left.
const slideDirection = ref('next')

// ─── Computed ─────────────────────────────────────────────────

const currentItem = computed(() => props.items[currentIndex.value])
const totalItems = computed(() => props.items.length)
const isFirstItem = computed(() => currentIndex.value === 0)
const isLastItem = computed(() => currentIndex.value === totalItems.value - 1)

// Single source of truth for item metadata — used by both the gallery
// grid and the modal, eliminating the inline ternary duplication.
const getItemMetadata = (item) => {
  if (!item) return {}
  switch (props.category) {
    case 'painting':
      return {
        title: item.name,
        year: item.year,
        details: `${item.medium} ${item.width}"×${item.height}"`,
      }
    case 'design':
      return { title: item.name, year: item.year, details: item.program }
    case 'website':
      return { title: item.name, year: item.year, details: item.task }
    default:
      return {}
  }
}

const currentMetadata = computed(() => getItemMetadata(currentItem.value))

// Motion animate target for the modal image pan+zoom.
// Motion drives this directly — no manual transform string needed.
const imageAnimate = computed(() => ({
  scale: zoom.value,
  x: (pan.value.x + dragDelta.value.x) / zoom.value,
  y: (pan.value.y + dragDelta.value.y) / zoom.value,
}))

// Slide animation variants — direction-aware for next/prev navigation.
const slideInitial = computed(() => ({ x: slideDirection.value === 'next' ? 80 : -80, opacity: 0 }))
const slideExit = computed(() => ({ x: slideDirection.value === 'next' ? -80 : 80, opacity: 0 }))
const slideTransition = { type: 'spring', stiffness: 300, damping: 30 }

// ─── Modal lifecycle ──────────────────────────────────────────

const resetZoom = () => {
  zoom.value = 1
  pan.value = { x: 0, y: 0 }
  dragDelta.value = { x: 0, y: 0 }
}

const openModal = (index) => {
  currentIndex.value = index
  resetZoom()
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  document.body.style.overflow = 'auto'
  resetZoom()
}

// ─── Navigation ───────────────────────────────────────────────

const nextImage = () => {
  if (isLastItem.value) return
  slideDirection.value = 'next'
  currentIndex.value++
  resetZoom()
}

const prevImage = () => {
  if (isFirstItem.value) return
  slideDirection.value = 'prev'
  currentIndex.value--
  resetZoom()
}

// ─── Zoom ─────────────────────────────────────────────────────

const zoomIn = () => {
  if (zoom.value < 4) zoom.value += 0.25
}
const zoomOut = () => {
  if (zoom.value > 1) zoom.value -= 0.25
}

// ─── Pan (drag to move zoomed image) ──────────────────────────
// mousemove is registered only while dragging — not on every mouse
// movement over the image viewer. This avoids firing the handler
// 60+ times per second when the user is just hovering.

const onDragStart = (e) => {
  if (zoom.value <= 1) return
  isDragging.value = true
  dragStart.value = { x: e.clientX, y: e.clientY }
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', onDragEnd)
}

const onDragMove = (e) => {
  dragDelta.value = {
    x: e.clientX - dragStart.value.x,
    y: e.clientY - dragStart.value.y,
  }
}

const onDragEnd = () => {
  isDragging.value = false
  pan.value = {
    x: pan.value.x + dragDelta.value.x,
    y: pan.value.y + dragDelta.value.y,
  }
  dragDelta.value = { x: 0, y: 0 }
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
}

// ─── Keyboard navigation ──────────────────────────────────────
// Listener is added only while the modal is open.

const handleKeydown = (e) => {
  switch (e.key) {
    case 'ArrowLeft':
      prevImage()
      e.preventDefault()
      break
    case 'ArrowRight':
      nextImage()
      e.preventDefault()
      break
    case '+':
    case '=':
      zoomIn()
      e.preventDefault()
      break
    case '-':
    case '_':
      zoomOut()
      e.preventDefault()
      break
    case 'Escape':
      closeModal()
      e.preventDefault()
      break
    case '0':
      resetZoom()
      e.preventDefault()
      break
  }
}

watch(isModalOpen, (open) => {
  if (open) window.addEventListener('keydown', handleKeydown)
  else window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="carousel-wrapper">
    <!-- Gallery grid -->
    <div class="gallery-grid">
      <article
        v-for="(item, index) in items"
        :key="item.name"
        class="gallery-item"
        @click="openModal(index)"
      >
        <figure class="gallery-figure">
          <!-- loading="lazy" defers off-screen images until they near
               the viewport — critical since this component is used
               three times and most images start below the fold. -->
          <img :src="item.link" :alt="item.name" class="gallery-image" loading="lazy" />
        </figure>
        <h1 class="gallery-title">{{ item.name }} ({{ item.year }})</h1>
        <h2 class="gallery-description">{{ getItemMetadata(item).details }}</h2>
      </article>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <AnimatePresence>
        <Motion
          v-if="isModalOpen"
          as="div"
          class="modal-overlay"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :transition="{ duration: 0.2 }"
          @click.self="closeModal"
        >
          <div class="modal-content">
            <button class="modal-close" @click="closeModal" aria-label="Close modal">✕</button>

            <!-- Image viewer — drag to pan when zoomed -->
            <div class="image-viewer" :class="{ dragging: isDragging }" @mousedown="onDragStart">
              <!-- MotionPresence animates the outgoing image out and the
                   incoming image in when currentIndex changes.
                   :key on the Motion element is required — it tells
                   MotionPresence that a new element has replaced the old one. -->
              <AnimatePresence>
                <Motion
                  :key="currentItem.link"
                  as="img"
                  class="modal-image"
                  :src="currentItem.link"
                  :alt="currentMetadata.title"
                  draggable="false"
                  :initial="slideInitial"
                  :animate="{ ...imageAnimate, opacity: 1 }"
                  :exit="slideExit"
                  :transition="slideTransition"
                />
              </AnimatePresence>
            </div>

            <!-- Zoom controls -->
            <div class="modal-controls">
              <button
                class="control-btn"
                @click="zoomOut"
                :disabled="zoom === 1"
                aria-label="Zoom out"
                title="Zoom Out (- key)"
              >
                −
              </button>
              <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
              <button
                class="control-btn"
                @click="zoomIn"
                :disabled="zoom >= 4"
                aria-label="Zoom in"
                title="Zoom In (+ key)"
              >
                +
              </button>
              <button
                v-if="zoom > 1"
                class="control-btn reset-btn"
                @click="resetZoom"
                aria-label="Reset zoom"
                title="Reset Zoom (0 key)"
              >
                Reset
              </button>
            </div>

            <!-- Navigation -->
            <div class="modal-nav">
              <button
                class="nav-btn"
                @click="prevImage"
                :disabled="isFirstItem"
                aria-label="Previous image"
                title="Previous (← key)"
              >
                ❮
              </button>
              <div class="image-counter">{{ currentIndex + 1 }} / {{ totalItems }}</div>
              <button
                class="nav-btn"
                @click="nextImage"
                :disabled="isLastItem"
                aria-label="Next image"
                title="Next (→ key)"
              >
                ❯
              </button>
            </div>

            <!-- Metadata -->
            <div class="modal-metadata">
              <h2 class="modal-title">{{ currentMetadata.title }}</h2>
              <p class="modal-year">({{ currentMetadata.year }})</p>
              <p class="modal-details">{{ currentMetadata.details }}</p>
            </div>
          </div>
        </Motion>
      </AnimatePresence>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
.carousel-wrapper {
  width: 100%;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  width: 80%;
  margin: 0 auto;

  /* 1. New 'Only Child' Logic (Nested with &) */
  &:has(> :only-child) {
    justify-content: center;

    & > :only-child {
      max-width: 350px;
      margin: 0 auto;
    }
  }

  /* 2. Media Queries (Nested inside the class) */
  @media (width <= 768px) {
    gap: 1rem;
    width: 90%;
  }

  @media (width <= 480px) {
    grid-template-columns: 1fr;
    width: 95%;
  }
}

.gallery-item {
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);

    .gallery-image {
      transform: scale(1.05);
    }
  }
}

.gallery-figure {
  margin: 0;
  overflow: hidden;
  border-radius: 8px;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  display: block;
}

.gallery-title {
  font-size: 1.1rem;
  margin: 0.75rem 0 0.25rem;
  padding-top: 10px;
  font-family: var(--serif-typeface);
  white-space: normal;
}

.gallery-description {
  font-size: 0.95rem;
  margin: 0;
  color: var(--light);
  font-family: var(--sans-serif-typeface);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 95%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  position: relative;
  width: 90%;
  height: 90vh;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgb(0 0 0 / 80%);
}

.modal-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgb(200 255 0 / 10%);
  border: 2px solid var(--primary);
  color: var(--primary);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    background: rgb(200 255 0 / 20%);
    transform: rotate(90deg);
  }

  &:active {
    transform: scale(0.95) rotate(90deg);
  }
}

.image-viewer {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  user-select: none;
  cursor: grab;

  &.dragging {
    cursor: grabbing;
  }
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;

  // will-change set here rather than by Motion so it persists
  // across the enter/exit animation cycle.
  will-change: transform, opacity;
  position: absolute;
}

.modal-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: rgb(0 0 0 / 50%);
  border-top: 1px solid rgb(200 255 0 / 20%);
}

.control-btn {
  background: rgb(200 255 0 / 10%);
  border: 2px solid var(--primary);
  color: var(--primary);
  width: 40px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgb(200 255 0 / 20%);
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
}

.reset-btn {
  background: rgb(200 255 0 / 5%);
  font-size: 0.85rem;
  width: auto;
  padding: 0.5rem 1rem;
}

.zoom-level {
  color: var(--primary);
  font-weight: bold;
  min-width: 60px;
  text-align: center;
  font-family: 'Courier New', monospace;
}

.modal-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  background: rgb(0 0 0 / 50%);
  border-top: 1px solid rgb(200 255 0 / 20%);
}

.nav-btn {
  background: rgb(200 255 0 / 10%);
  border: 2px solid var(--primary);
  color: var(--primary);
  width: 50px;
  height: 50px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgb(200 255 0 / 20%);
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
}

.image-counter {
  color: var(--light);
  font-family: 'Courier New', monospace;
  font-weight: bold;
  min-width: 80px;
  text-align: center;
}

.modal-metadata {
  padding: 1.5rem;
  background: rgb(0 0 0 / 70%);
  border-top: 1px solid rgb(200 255 0 / 20%);
  text-align: center;

  .modal-title {
    color: var(--primary);
    font-size: 1.3rem;
    margin: 0 0 0.25rem;
  }

  .modal-year {
    color: var(--light);
    font-size: 0.9rem;
    margin: 0 0.5rem 0.5rem 0;
    display: inline;
  }

  .modal-details {
    color: var(--light);
    font-size: 0.95rem;
    margin: 0;
    font-family: var(--sans-serif-typeface);
  }
}

@media (width <= 768px) {
  .modal-content {
    height: 85vh;
  }

  .modal-controls {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .control-btn {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }

  .modal-nav {
    padding: 0.75rem;
    gap: 1rem;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .image-counter {
    font-size: 0.9rem;
    min-width: auto;
  }

  .modal-metadata {
    padding: 1rem;

    .modal-title {
      font-size: 1.1rem;
    }

    .modal-details {
      font-size: 0.85rem;
    }
  }
}
</style>
