<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['shuffle', 'clear-table', 'deal-spread', 'reset', 'toggle-reversal'])
const isMenuOpen = ref(false)
const touchStartY = ref<number | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

const openOffset = computed(() => {
  const panel = panelRef.value

  if (!panel) return 0

  return panel.offsetHeight
})

const triggerTransform = computed(() => {
  if (!isMenuOpen.value) return 'translateY(0)'

  return `translateY(-${openOffset.value}px)`
})

watch(
  isMenuOpen,
  () => {
    nextTick(() => {
      if (!triggerRef.value || !panelRef.value) return
      const offset = panelRef.value.offsetHeight
      if (isMenuOpen.value) {
        triggerRef.value.style.transform = `translateY(-${offset}px)`
      } else {
        triggerRef.value.style.transform = 'translateY(0)'
      }
    })
  },
  { flush: 'post' },
)

onMounted(() => {
  const updateMetrics = () => {
    if (!triggerRef.value || !panelRef.value) return
    const offset = panelRef.value.offsetHeight
    triggerRef.value.style.transform = isMenuOpen.value
      ? `translateY(-${offset}px)`
      : 'translateY(0)'
  }

  updateMetrics()

  const resizeObserver = new ResizeObserver(() => updateMetrics())

  if (triggerRef.value) resizeObserver.observe(triggerRef.value)
  if (panelRef.value) resizeObserver.observe(panelRef.value)

  window.addEventListener('resize', updateMetrics)

  onBeforeUnmount(() => {
    resizeObserver.disconnect()
    window.removeEventListener('resize', updateMetrics)
  })
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleAction = (handler: () => void) => {
  handler()
}

const handleTouchStart = (event: TouchEvent) => {
  touchStartY.value = event.touches[0].clientY
}

const handleTouchMove = (event: TouchEvent) => {
  if (touchStartY.value === null) return

  const deltaY = touchStartY.value - event.touches[0].clientY

  if (deltaY > 40) {
    isMenuOpen.value = true
  } else if (deltaY < -40) {
    isMenuOpen.value = false
  }
}

const handleTouchEnd = () => {
  touchStartY.value = null
}
</script>

<template>
  <nav
    class="oracle-nav"
    :class="{ open: isMenuOpen }"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <button
      ref="triggerRef"
      class="nav-trigger"
      :class="{ open: isMenuOpen }"
      :style="{ transform: triggerTransform }"
      @click="toggleMenu"
    >
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
.oracle-nav {
  position: fixed;
  left: 50%;
  bottom: 0;
  width: min(92vw, 100vw);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
  touch-action: pan-y;
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
  transform: translateY(0);
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.3s ease-in;
  box-shadow: 0 -4px 12px rgb(0 0 0 / 18%);
}

.nav-trigger:hover {
  color: var(--primary);
  background: transparent;
}

.menu-panel {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%) translateY(100%);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: min(92vw, 520px);
  padding: 0.9rem;
  border: 1px solid var(--primary);
  border-radius: 1rem 1rem 0 0;
  background: var(--glass);
  backdrop-filter: blur(10px);
  opacity: 0;
  visibility: visible;
  pointer-events: none;
  transition:
    opacity 0.3s ease-in,
    transform 0.3s ease-in;
}

.menu-panel.open {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(-50%) translateY(0);
}

.nav-trigger.open {
  transform: translateY(-1px);
}

.nav-trigger.closed {
  transform: translateY(0);
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
  background: transparent;
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
