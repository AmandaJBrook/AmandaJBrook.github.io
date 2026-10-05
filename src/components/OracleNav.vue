<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, type CSSProperties } from 'vue'

const emit = defineEmits(['shuffle', 'clear-table', 'deal-spread', 'reset', 'toggle-reversal'])

const DRAG_SLOP = 6 // px a touch must travel before it becomes a drag (keeps taps working)
const FLICK_VELOCITY = 0.4 // px/ms; a fast flick wins over where the panel was released

const isMenuOpen = ref(false)
const navRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const panelHeight = ref(0)

// 0 = closed … 1 = open while a finger is dragging; null when idle
const dragProgress = ref<number | null>(null)
const isDragging = computed(() => dragProgress.value !== null)

// One variable (--progress) drives the trigger, panel position and panel opacity.
// Idle: CSS sets it from the .open class. Dragging: we override it inline.
const navStyle = computed(
  () =>
    ({
      '--panel-h': `${panelHeight.value}px`,
      ...(dragProgress.value !== null && { '--progress': dragProgress.value }),
    }) as CSSProperties,
)

let resizeObserver: ResizeObserver | undefined

onMounted(() => {
  if (!panelRef.value) return
  const panel = panelRef.value
  const sync = () => (panelHeight.value = panel.offsetHeight)
  sync()
  resizeObserver = new ResizeObserver(sync)
  resizeObserver.observe(panel)
})

onBeforeUnmount(() => resizeObserver?.disconnect())

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleAction = (handler: () => void) => {
  handler()
}

/* ---------- swipe gesture (touch + pen; mouse users just click) ---------- */

let pointerId: number | null = null
let startY = 0
let startProgress = 0
let lastY = 0
let lastT = 0
let velocity = 0 // px/ms, positive = moving down
let swiped = false

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

const onPointerDown = (e: PointerEvent) => {
  if (e.pointerType === 'mouse' || !e.isPrimary) return
  pointerId = e.pointerId
  startY = lastY = e.clientY
  lastT = e.timeStamp
  velocity = 0
  startProgress = isMenuOpen.value ? 1 : 0
}

const onPointerMove = (e: PointerEvent) => {
  if (e.pointerId !== pointerId) return

  const dy = e.clientY - startY

  if (dragProgress.value === null) {
    if (Math.abs(dy) < DRAG_SLOP) return
    navRef.value?.setPointerCapture(e.pointerId) // keep receiving moves even if the finger leaves the nav
    swiped = true
  }

  const dt = e.timeStamp - lastT
  if (dt > 0) velocity = 0.7 * velocity + 0.3 * ((e.clientY - lastY) / dt)
  lastY = e.clientY
  lastT = e.timeStamp

  // Panel follows the finger: drag up = more open, drag down = more closed
  dragProgress.value = clamp01(startProgress - dy / (panelHeight.value || 1))
}

const endGesture = (e: PointerEvent) => {
  if (e.pointerId !== pointerId) return
  pointerId = null

  const progress = dragProgress.value
  if (progress === null) return // it was a tap, let click handle it

  // Flick direction wins; otherwise snap to whichever end is closer
  isMenuOpen.value = Math.abs(velocity) > FLICK_VELOCITY ? velocity < 0 : progress >= 0.5
  dragProgress.value = null

  // Swallow the click that can follow a swipe, then re-arm
  setTimeout(() => (swiped = false))
}

const onClickCapture = (e: MouseEvent) => {
  if (!swiped) return
  e.stopPropagation()
  e.preventDefault()
}
</script>

<template>
  <nav
    ref="navRef"
    class="oracle-nav"
    :class="{ open: isMenuOpen, dragging: isDragging }"
    :style="navStyle"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="endGesture"
    @pointercancel="endGesture"
    @click.capture="onClickCapture"
  >
    <button class="nav-trigger" @click="toggleMenu">
      {{ isMenuOpen ? 'Close Actions' : 'Oracle Actions' }}
    </button>

    <div ref="panelRef" class="menu-panel" :class="{ open: isMenuOpen }">
      <section class="shuffle-controls">
        <button @click="handleAction(() => emit('shuffle', 'riffle'))">Riffle</button>
        <button @click="handleAction(() => emit('shuffle', 'overhand'))">Overhand</button>
        <button @click="handleAction(() => emit('shuffle', 'fisher-yates'))">Random</button>
        <button @click="handleAction(() => emit('shuffle', 'cut'))">Cut</button>
        <button @click="handleAction(() => emit('clear-table'))">Clear Table</button>
        <button @click="handleAction(() => emit('reset'))">Reset</button>
        <label>
          <input
            type="checkbox"
            role="switch"
            @change="handleAction(() => emit('toggle-reversal'))"
            aria-checked="false"
          />
          Reversal Mode
        </label>
      </section>
      <section class="spread-controls">
        <button @click="handleAction(() => emit('deal-spread', 'past-present-future'))">
          Past · Present · Future
        </button>
        <button @click="handleAction(() => emit('deal-spread', 'celtic-cross'))">
          Celtic Cross
        </button>
        <button @click="handleAction(() => emit('deal-spread', 'me-them-us'))">
          Me · Them · Us
        </button>
      </section>
    </div>
  </nav>
</template>

<style scoped lang="scss">
* {
  text-transform: lowercase;
}

.oracle-nav {
  --progress: 0; // 0 = closed, 1 = open; overridden inline while dragging

  position: fixed;
  left: 50%;
  bottom: 0;
  width: min(92vw, 100vw);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
  touch-action: none; // the nav owns its vertical gestures; the page behind still scrolls

  &.open {
    --progress: 1;
  }

  // While a finger is down, follow it 1:1 with no easing
  &.dragging .nav-trigger,
  &.dragging .menu-panel {
    transition: none;
  }
}

.nav-trigger {
  position: relative;
  z-index: 3;
  margin: 0;
  padding: 0.6rem 1.25rem;
  border: 1px solid var(--primary);
  border-bottom: none;
  border-radius: var(--oracle-button-radius) var(--oracle-button-radius) 0 0;
  background: var(--glass);
  color: var(--light);
  font-family: var(--serif-typeface);
  letter-spacing: 0.12rem;
  cursor: pointer;
  transform: translateY(calc(var(--panel-h, 0px) * var(--progress) * -1));
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.3s ease-out;
  box-shadow: 0 -4px 12px rgb(0 0 0 / 18%);
}

.nav-trigger:hover {
  color: var(--primary);
}

.menu-panel {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%) translateY(calc((1 - var(--progress)) * 100%));
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: min(92vw, 520px);
  padding: 0.9rem;
  border: 1px solid var(--primary);
  border-radius: 1rem 1rem 0 0;
  background: var(--glass);
  backdrop-filter: blur(10px);
  opacity: var(--progress);
  visibility: visible;
  pointer-events: none;
  transition:
    opacity 0.3s ease-out,
    transform 0.3s ease-out;
}

.menu-panel.open {
  pointer-events: auto;
}

.shuffle-controls,
.spread-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

button,
label {
  font-family: var(--sans-serif-typeface);
  font-size: 0.8rem;
}

button {
  border: 1px solid rgb(255 255 255 / 25%);
  border-radius: var(--oracle-button-radius);
  background: rgb(255 255 255 / 4%);
  color: var(--light);
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;
}

button:hover {
  color: var(--primary);
}

label {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--light);
  padding: 0.45rem 0.75rem;
}

input[type='checkbox'] {
  accent-color: var(--primary);
}
</style>
