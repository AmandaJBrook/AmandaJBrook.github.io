<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Motion, AnimatePresence } from 'motion-v'
import type { DesignData, PaintingData, WebsiteData } from '@/types/portfolio'
import { getPortfolioImage } from '@/utils/portfolioImages'

// ─── Prop types ───────────────────────────────────────────────
// category is a closed union — adding a new type requires updating
// both this type and the getItemMetadata switch below.
type CarouselCategory = 'painting' | 'design' | 'website'
type CarouselItem = PaintingData | DesignData | WebsiteData

// ─── Item metadata ────────────────────────────────────────────
// Returned by getItemMetadata — consistent shape for both the
// gallery grid and the modal regardless of category.
interface ItemMetadata {
  title: string
  year: string
  details: string
}

// ─── Slide direction ──────────────────────────────────────────
type SlideDirection = 'next' | 'prev'

const props = withDefaults(
  defineProps<{
    items: CarouselItem[]
    category: CarouselCategory
  }>(),
  {
    items: () => [],
  },
)

// ─── Carousel scrolling ───────────────────────────────────────
// The side-scrolling and snap-to-card feel is native CSS
// (scroll-snap-type + scroll-snap-align below) — the browser handles
// touch swipes, trackpad, and click-drag scrollbars for free.
//
// True looping (in EITHER direction, from a swipe, trackpad, or an
// arrow click) needs a bit more than CSS alone can do: the track
// renders the item list three times back to back, starts scrolled
// into the middle copy, and — once the user has scrolled deep enough
// into the first or third copy — silently jumps back into the
// equivalent spot in the middle copy. Because the copies are
// identical, that jump is invisible; it just looks like it kept going.

const SET_COUNT = 3

const loopItems = computed(() =>
  props.items.length > 1
    ? Array.from({ length: SET_COUNT }, () => props.items).flat()
    : props.items,
)

// Maps a position in the tripled loopItems array back to the real
// index in props.items — needed for the modal, which only knows about
// the original (non-duplicated) list.
const realIndex = (loopIndex: number) => loopIndex % props.items.length

const trackRef = ref<HTMLElement | null>(null)
let lastSetWidth = 0

// The scroll position we last told the browser to head toward. Reading
// track.scrollLeft fresh on every click is what caused "sometimes does
// nothing": if the previous smooth-scroll (or the browser's own
// scroll-snap settling) hasn't finished, that read lands mid-animation,
// and the browser's snap logic can round the next target right back to
// the card you're already on. Tracking our own target sidesteps that.
let targetScrollLeft: number | null = null

// Measures the actual on-screen gap between two rendered cards,
// instead of trusting getComputedStyle(track).columnGap. That value
// was quietly off in Firefox for this layout — turning the 2rem gap
// off in devtools fixed the right-edge cutoff, which only makes sense
// if the reported gap wasn't matching what was actually being
// rendered. Measuring the real gap between two cards sidesteps the
// question of why entirely; it reads what's actually there.
const measureGap = (track: HTMLElement): number => {
  const cards = track.querySelectorAll<HTMLElement>('.gallery-item')
  if (cards.length < 2) return 0
  const gap = cards[1].offsetLeft - (cards[0].offsetLeft + cards[0].offsetWidth)
  return Math.max(0, gap)
}

// ─── Card sizing ──────────────────────────────────────────────
// Rather than a fixed width or a fluid clamp() that may or may not
// divide evenly into the track's actual width, this measures the
// track and solves for a card width that fits a WHOLE number of
// cards exactly — so there's never a partial card cut off at either
// edge. IDEAL_CARD_WIDTH is a target, not a guarantee: the real width
// gets nudged up or down slightly so the fit comes out exact.
const IDEAL_CARD_WIDTH = 260
const PHONE_BREAKPOINT = 600 // below this, force exactly one full-width card

const cardWidthPx = ref(IDEAL_CARD_WIDTH)

const updateCardWidth = () => {
  const track = trackRef.value
  if (!track) return

  const gap = measureGap(track)
  const available = track.clientWidth
  if (!available) return

  // With margin-inline giving every card spacing on both sides, N
  // cards now consume N × (cardWidth + gap) in total — unlike the old
  // gap-based layout, where only N-1 gaps existed between cards. The
  // formulas below are solved for that.
  const count =
    available < PHONE_BREAKPOINT ? 1 : Math.max(1, Math.round(available / (IDEAL_CARD_WIDTH + gap)))

  // Rounded to a whole pixel — offsetWidth (read elsewhere for the
  // loop and click-scroll math) always rounds to a whole pixel too.
  // Assigning a fractional width here would make the browser's
  // rendered layout not quite match what that math thinks is
  // rendered, and the gap between the two compounds across cards.
  //
  // No extra padding is added to soak up the rounding remainder —
  // that remainder is at most a fraction of a pixel per card, and
  // adding real padding on top of a width already sized to fill the
  // full available space just made the cards overflow it instead
  // (padding shrinks the content box; the cards, sized for the
  // pre-padding box, no longer fit and spill out the right edge).
  const rawCardWidth = available / count - gap
  cardWidthPx.value = Math.round(rawCardWidth)
}

const singleSetWidth = () => {
  const track = trackRef.value
  if (!track || props.items.length === 0) return 0

  // Measured from an actual card's rendered size rather than
  // track.scrollWidth / SET_COUNT, which stays accurate regardless of
  // how updateCardWidth() above resizes cards.
  const firstCard = track.querySelector('.gallery-item') as HTMLElement | null
  const gap = measureGap(track)
  const cardSpan = firstCard ? firstCard.offsetWidth + gap : 0
  return cardSpan * props.items.length
}

// Fires after native scrolling comes to rest (swipe, trackpad, or the
// arrow buttons below all end up here). Jumps back into the middle
// copy with no animation the instant we're clearly inside a clone —
// at that scroll position the pixels are identical either way.
const normalizeLoopPosition = () => {
  const track = trackRef.value
  const setWidth = singleSetWidth()
  if (!track || !setWidth) return

  if (track.scrollLeft < setWidth * 0.5) {
    track.scrollLeft += setWidth
  } else if (track.scrollLeft > setWidth * 1.5) {
    track.scrollLeft -= setWidth
  }
  lastSetWidth = setWidth

  // Scrolling (from a swipe, trackpad, or an arrow click) has fully
  // settled — any click-tracked target above is stale now, so the next
  // click should measure fresh from the real, resting scrollLeft.
  targetScrollLeft = null
}

// Keeps the same relative scroll position after a resize (card widths
// change) — without this, resizing mid-scroll could land you on the
// wrong copy of the loop.
const onResize = () => {
  const track = trackRef.value
  const newSetWidth = singleSetWidth()
  if (!track || !newSetWidth || !lastSetWidth) {
    lastSetWidth = newSetWidth
    return
  }
  track.scrollLeft = (track.scrollLeft / lastSetWidth) * newSetWidth
  lastSetWidth = newSetWidth
}

let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  await nextTick()
  const track = trackRef.value
  if (!track) return

  updateCardWidth()
  await nextTick() // let the new --card-width actually apply before measuring cards

  if (props.items.length > 1) {
    track.scrollLeft = singleSetWidth() // start already inside the middle copy
    lastSetWidth = singleSetWidth()
    track.addEventListener('scrollend', normalizeLoopPosition)
  }

  // ResizeObserver reacts to the track's own size changing (window
  // resize, sidebar toggle, orientation change, anything) rather than
  // only window resize events.
  resizeObserver = new ResizeObserver(async () => {
    updateCardWidth()
    await nextTick()
    if (props.items.length > 1) onResize()
  })
  resizeObserver.observe(track)
})

onBeforeUnmount(() => {
  trackRef.value?.removeEventListener('scrollend', normalizeLoopPosition)
  resizeObserver?.disconnect()
})

const scrollByOne = (direction: 1 | -1) => {
  const track = trackRef.value
  if (!track) return

  const firstCard = track.querySelector('.gallery-item') as HTMLElement | null
  const gap = measureGap(track)
  const step = firstCard ? firstCard.offsetWidth + gap : track.clientWidth

  // Base the new target off our own last commanded position when one
  // is in flight, rather than track.scrollLeft — see the comment on
  // targetScrollLeft above for why that was causing dropped clicks.
  const base = targetScrollLeft ?? track.scrollLeft
  targetScrollLeft = base + direction * step

  // No wrap-check needed here — there's always a duplicated copy ahead
  // to scroll into, and normalizeLoopPosition quietly resets the
  // position once the scroll settles.
  track.scrollTo({ left: targetScrollLeft, behavior: 'smooth' })
}

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
const slideDirection = ref<SlideDirection>('next')

// ─── Computed ─────────────────────────────────────────────────

const currentItem = computed(() => props.items[currentIndex.value])
const totalItems = computed(() => props.items.length)
const isFirstItem = computed(() => currentIndex.value === 0)
const isLastItem = computed(() => currentIndex.value === totalItems.value - 1)

// Single source of truth for item metadata — used by both the gallery
// grid and the modal, eliminating the inline ternary duplication.
const getItemMetadata = (item: CarouselItem): ItemMetadata => {
  switch (props.category) {
    case 'painting': {
      const p = item as PaintingData
      return { title: p.name, year: p.year, details: `${p.medium} ${p.width}"×${p.height}"` }
    }
    case 'design': {
      const d = item as DesignData
      return { title: d.name, year: d.year, details: d.program }
    }
    case 'website': {
      const w = item as WebsiteData
      return { title: w.name, year: w.year, details: w.task }
    }
  }
}

const currentMetadata = computed(() => getItemMetadata(currentItem.value))

// ─── Blurred image placeholders ───────────────────────────────
// Each card shows a tiny blurred copy of its image (generated at build
// time by vite-plugin-lqip) until the real image finishes loading, then
// drops it. It has to be dropped rather than left behind the image:
// any transparent areas in a PNG would otherwise show the blur through.
//
// Tracked by link, not by card, because the track renders every item
// three times for the infinite loop — one load clears all three copies.
const loadedLinks = reactive(new Set<string>())

const placeholderStyle = (link: string) => {
  const { lqip } = getPortfolioImage(link)
  if (!lqip || loadedLinks.has(link)) return undefined
  return { backgroundImage: `url(${lqip})`, backgroundSize: '100% 100%' }
}

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
const slideTransition = { type: 'spring', stiffness: 300, damping: 30 } as const

// ─── Modal lifecycle ──────────────────────────────────────────

const resetZoom = () => {
  zoom.value = 1
  pan.value = { x: 0, y: 0 }
  dragDelta.value = { x: 0, y: 0 }
}

const openModal = (index: number) => {
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

const onDragStart = (e: MouseEvent) => {
  if (zoom.value <= 1) return
  isDragging.value = true
  dragStart.value = { x: e.clientX, y: e.clientY }
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', onDragEnd)
}

const onDragMove = (e: MouseEvent) => {
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

const handleKeydown = (e: KeyboardEvent) => {
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
    <!-- Gallery track — native scroll + snap does the sliding; the
         arrows just call scrollByOne, which loops back at either end. -->
    <div class="carousel-track-wrap">
      <button
        v-if="items.length > 1"
        class="carousel-nav prev"
        @click="scrollByOne(-1)"
        aria-label="Previous"
      >
        <svg
          data-v-5b3d07c1=""
          class="summary-chevron"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          aria-hidden="true"
        >
          <polyline data-v-5b3d07c1="" points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div class="gallery-grid" ref="trackRef" :style="{ '--card-width': `${cardWidthPx}px` }">
        <article
          v-for="(item, index) in loopItems"
          :key="index"
          class="gallery-item"
          @click="openModal(realIndex(index))"
        >
          <figure class="gallery-figure"></figure>
          <img
            :src="getPortfolioImage(item.link).src"
            :width="getPortfolioImage(item.link).width"
            :height="getPortfolioImage(item.link).height"
            :style="placeholderStyle(item.link)"
            :alt="item.name"
            class="gallery-image"
            loading="lazy"
            @load="loadedLinks.add(item.link)"
          />
          <h1 class="gallery-title">{{ item.name }} ({{ item.year }})</h1>
          <h2 class="gallery-description">{{ getItemMetadata(item).details }}</h2>
        </article>
      </div>

      <button
        v-if="items.length > 1"
        class="carousel-nav next"
        @click="scrollByOne(1)"
        aria-label="Next"
      >
        <svg
          data-v-5b3d07c1=""
          class="summary-chevron"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          aria-hidden="true"
        >
          <polyline data-v-5b3d07c1="" points="9 6 15 12 9 18"></polyline>
        </svg>
      </button>
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
                  :src="getPortfolioImage(currentItem.link).src"
                  :alt="currentMetadata.title"
                  loading="lazy"
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
  max-width: 100vw;
  overflow: hidden;
}

.carousel-track-wrap {
  position: relative;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;

  // Single source of truth for the arrow circles. Both the wrap's
  // padding (below) and .carousel-nav read these, so the reserved
  // room can never drift out of sync with the arrow's actual size.
  //   --nav-size  the circle's diameter
  //   --nav-inset breathing room between the circle and the wrapper's
  //               edge, so the 2px border, anti-aliasing, and the
  //               hover scale(1.1) never touch (or get clipped by)
  //               .carousel-wrapper's overflow: hidden
  //   --nav-gap   space between the circle and the first/last card
  --nav-size: 32px;
  --nav-inset: 4px;
  --nav-gap: 8px;

  // Reserves the arrow's full footprint on each side. The gallery
  // grid gets narrower by exactly this much — updateCardWidth() reads
  // the track's clientWidth through a ResizeObserver, so the cards
  // re-fit the smaller track automatically.
  padding-inline: calc(var(--nav-inset) + var(--nav-size) + var(--nav-gap));

  @media (width > 480px) {
    --nav-size: 36px;
  }

  @media (width > 768px) {
    --nav-size: 44px;
    --nav-inset: 6px; // 44px × 1.1 hover scale grows ~2px per side
  }
}

.gallery-grid {
  display: flex;

  // Without this, flex's default align-items: stretch makes every
  // card match the height of the tallest one in the row — since
  // images keep their natural aspect ratio now, a single portrait
  // image would stretch every shorter landscape card to match it,
  // padding them with blank space and inflating the whole carousel's
  // height with room nothing is using.
  align-items: flex-start;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  // The carousel mechanic itself: native horizontal scroll that snaps
  // to each card. No JS drag-tracking, no library — the browser gives
  // touch swipe, trackpad, and momentum scrolling for free.
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 1rem;
  -webkit-overflow-scrolling: touch;

  // Hide the scrollbar since the arrows + swipe/drag are the intended
  // way to move the track — a visible scrollbar under a snap carousel
  // usually just looks like a layout glitch.
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  /* 1. New 'Only Child' Logic (Nested with &) */
  &:has(> :only-child) {
    justify-content: center;

    & > :only-child {
      max-width: 350px;
      margin: 0 auto;
    }
  }
}

.carousel-nav {
  position: absolute;
  top: 40%;
  transform: translateY(-50%);
  z-index: 2;
  background: rgb(200 255 0 / 10%);
  border: 2px solid var(--primary);
  color: var(--primary);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  // Size and edge offset come from the variables on .carousel-track-wrap,
  // so the circle always sits fully inside the padding reserved for it.
  box-sizing: border-box;
  width: var(--nav-size);
  height: var(--nav-size);
  font-size: 1rem;

  &:hover {
    background: rgb(200 255 0 / 20%);
    transform: translateY(-50%) scale(1.1);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  &.prev {
    left: var(--nav-inset);
  }

  &.next {
    right: var(--nav-inset);
  }

  @media (width > 480px) {
    font-size: 1.1rem;
  }

  @media (width > 768px) {
    font-size: 1.3rem;
  }
}

.gallery-item {
  // Set by updateCardWidth() in the script — solved so a whole number
  // of cards always fits the track exactly, with none cut off at
  // either edge. The 260px fallback only matters for the instant
  // before the script's first measurement runs.
  flex: 0 0 var(--card-width, 260px);
  scroll-snap-align: start;
  scroll-snap-stop: always;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  // Even space on both sides of every card (rather than gap's one-sided
  // spacing, which only ever sits on one side of a given card). Half
  // of the old 1rem/2rem gap on each side, so two adjacent cards still
  // add up to the same total space between them.
  margin-inline: 0.5rem;

  @media (width > 768px) {
    margin-inline: 1rem;
  }

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
  height: auto;
  display: block;
  transition: transform 0.3s ease;
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
