<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  category: {
    type: String,
    required: true, // 'painting', 'design', or 'website'
  },
})

// Modal state
const isModalOpen = ref(false)
const currentIndex = ref(0)
const zoom = ref(1)
const pan = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const dragPan = ref({ x: 0, y: 0 })

// Computed
const currentItem = computed(() => props.items[currentIndex.value])
const imageUrl = computed(() => currentItem.value?.link)
const totalItems = computed(() => props.items.length)
const isFirstItem = computed(() => currentIndex.value === 0)
const isLastItem = computed(() => currentIndex.value === totalItems.value - 1)

// Get metadata based on category
const itemMetadata = computed(() => {
  const item = currentItem.value
  if (!item) return {}

  switch (props.category) {
    case 'painting':
      return {
        title: item.name,
        year: item.year,
        details: `${item.medium} ${item.width}"×${item.height}"`,
      }
    case 'design':
      return {
        title: item.name,
        year: item.year,
        details: item.program,
      }
    case 'website':
      return {
        title: item.name,
        year: item.year,
        details: item.task,
      }
    default:
      return {}
  }
})

// Methods
const openModal = (index) => {
  currentIndex.value = index
  isModalOpen.value = true
  zoom.value = 1
  pan.value = { x: 0, y: 0 }
  dragPan.value = { x: 0, y: 0 }
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  document.body.style.overflow = 'auto'
  zoom.value = 1
  pan.value = { x: 0, y: 0 }
  dragPan.value = { x: 0, y: 0 }
}

const nextImage = () => {
  if (!isLastItem.value) {
    currentIndex.value++
    resetZoomAndPan()
  }
}

const prevImage = () => {
  if (!isFirstItem.value) {
    currentIndex.value--
    resetZoomAndPan()
  }
}

const zoomIn = () => {
  if (zoom.value < 4) {
    zoom.value += 0.25
  }
}

const zoomOut = () => {
  if (zoom.value > 1) {
    zoom.value -= 0.25
  }
}

const resetZoom = () => {
  zoom.value = 1
  pan.value = { x: 0, y: 0 }
  dragPan.value = { x: 0, y: 0 }
}

const resetZoomAndPan = () => {
  zoom.value = 1
  pan.value = { x: 0, y: 0 }
  dragPan.value = { x: 0, y: 0 }
}

// Pan handlers
const handleMouseDown = (e) => {
  if (zoom.value > 1) {
    isDragging.value = true
    dragStart.value = { x: e.clientX, y: e.clientY }
  }
}

const handleMouseMove = (e) => {
  if (isDragging.value && zoom.value > 1) {
    const deltaX = e.clientX - dragStart.value.x
    const deltaY = e.clientY - dragStart.value.y

    dragPan.value = { x: deltaX, y: deltaY }
  }
}

const handleMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false
    pan.value = {
      x: pan.value.x + dragPan.value.x,
      y: pan.value.y + dragPan.value.y,
    }
    dragPan.value = { x: 0, y: 0 }
  }
}

// Keyboard navigation
const handleKeydown = (e) => {
  if (!isModalOpen.value) return

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

// Watch for keyboard events
watch(isModalOpen, (newVal) => {
  if (newVal) {
    window.addEventListener('keydown', handleKeydown)
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
})

// Transform style for image
const imageTransformStyle = computed(() => {
  const totalX = pan.value.x + dragPan.value.x
  const totalY = pan.value.y + dragPan.value.y
  return {
    transform: `scale(${zoom.value}) translate(${totalX / zoom.value}px, ${totalY / zoom.value}px)`,
    cursor: zoom.value > 1 ? 'grab' : 'pointer',
  }
})

const imageTransformStyleOnDrag = computed(() => ({
  ...imageTransformStyle.value,
  cursor: isDragging.value ? 'grabbing' : imageTransformStyle.value.cursor,
}))
</script>

<template>
  <div class="carousel-wrapper">
    <!-- Gallery Grid -->
    <div class="gallery-grid">
      <article
        v-for="(item, index) in items"
        :key="item.name"
        class="gallery-item"
        @click="openModal(index)"
      >
        <figure class="gallery-figure">
          <img :src="item.link" :alt="item.name" class="gallery-image" />
        </figure>
        <h1 class="gallery-title">{{ item.name }} ({{ item.year }})</h1>
        <h2 class="gallery-description">
          {{
            category === 'painting'
              ? `${item.medium} ${item.width}"×${item.height}"`
              : category === 'design'
                ? item.program
                : item.task
          }}
        </h2>
      </article>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <!-- Close Button -->
          <button class="modal-close" @click="closeModal" aria-label="Close modal">✕</button>

          <!-- Image Container -->
          <div
            class="image-viewer"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseUp"
          >
            <img
              :src="imageUrl"
              :alt="itemMetadata.title"
              :style="imageTransformStyleOnDrag"
              class="modal-image"
              draggable="false"
            />
          </div>

          <!-- Controls -->
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
              class="nav-btn prev-btn"
              @click="prevImage"
              :disabled="isFirstItem"
              aria-label="Previous image"
              title="Previous (← key)"
            >
              ❮
            </button>
            <div class="image-counter">{{ currentIndex + 1 }} / {{ totalItems }}</div>
            <button
              class="nav-btn next-btn"
              @click="nextImage"
              :disabled="isLastItem"
              aria-label="Next image"
              title="Next (→ key)"
            >
              ❯
            </button>
          </div>

          <!-- Image Metadata -->
          <div class="modal-metadata">
            <h2 class="modal-title">{{ itemMetadata.title }}</h2>
            <p class="modal-year">({{ itemMetadata.year }})</p>
            <p class="modal-details">{{ itemMetadata.details }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
.carousel-wrapper {
  width: 100%;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  width: 80%;
  margin: 0 auto;

  @media (width <= 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 95%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  animation: fade-in 0.2s ease-in-out;

  @keyframes fade-in {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
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

  &:hover .modal-image {
    cursor: grab;
  }

  &:active .modal-image {
    cursor: grabbing;
  }
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.1s ease-out;
  will-change: transform;
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
