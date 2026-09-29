<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Motion, AnimatePresence } from 'motion-v'

// ─── Show-once behavior ───────────────────────────────────────
// The notice appears once per browser session: dismissing it stores a
// flag in sessionStorage, so it won't reappear on every reload or
// route change, but a fresh visit (new tab/session) sees it again.
//
// Bump the version suffix (v1 → v2) after a big round of card changes
// and everyone who already dismissed it will see it again.
const STORAGE_KEY = 'oracle-beta-notice-v1'

// storage access can throw (private browsing, blocked cookies), so both
// helpers fail quietly — worst case the notice just shows again.
const hasSeenNotice = (): boolean => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'seen'
  } catch {
    return false
  }
}

const markSeen = () => {
  try {
    sessionStorage.setItem(STORAGE_KEY, 'seen')
  } catch {
    // nothing to do — see comment above
  }
}

// ─── State ────────────────────────────────────────────────────
const isOpen = ref(false)
const dismissBtn = ref<HTMLButtonElement | null>(null)
let previousBodyOverflow = ''

// ─── Open / close ─────────────────────────────────────────────
// Scroll is locked while the notice is up and restored to whatever it
// was before (rather than forced to 'auto'), so this can't undo a lock
// set by something else on the page.
const releaseLock = () => {
  document.body.style.overflow = previousBodyOverflow
  window.removeEventListener('keydown', onKeydown)
}

const open = async () => {
  isOpen.value = true
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKeydown)

  // Wait for the dialog to render, then move keyboard focus onto the
  // button so Enter/Space dismisses it right away.
  await nextTick()
  dismissBtn.value?.focus()
}

const close = () => {
  isOpen.value = false
  markSeen()
  releaseLock()
}

// The button is the only focusable element in the dialog, so Tab just
// keeps focus on it instead of wandering off to the page behind.
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
  } else if (e.key === 'Tab') {
    e.preventDefault()
    dismissBtn.value?.focus()
  }
}

onMounted(() => {
  if (!hasSeenNotice()) open()
})

// If the page is left while the notice is still open, don't leave the
// body scroll-locked or the key listener attached.
onBeforeUnmount(() => {
  if (isOpen.value) releaseLock()
})
</script>

<template>
  <!-- Teleported to <body> so it always sits above the page layout,
       wherever <BetaNoticeModal /> is placed in OracleView. -->
  <Teleport to="body">
    <AnimatePresence>
      <Motion
        v-if="isOpen"
        as="div"
        class="beta-overlay"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.2 }"
        @click.self="close"
      >
        <div
          class="beta-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="beta-title"
          aria-describedby="beta-message"
        >
          <h2 id="beta-title" class="beta-title">This page is in beta</h2>
          <p id="beta-message" class="beta-message">
            I'll be updating and changing cards throughout my creative process. Check back often to
            see what's changed.
          </p>
          <button ref="dismissBtn" type="button" class="beta-dismiss" @click="close">Got it</button>
        </div>
      </Motion>
    </AnimatePresence>
  </Teleport>
</template>

<style scoped lang="scss">
.beta-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgb(0 0 0 / 85%);

  // Above the fixed site navigation (z-index 100 on the home page).
  z-index: 200;
}

.beta-dialog {
  width: min(100%, 26rem);
  padding: 2rem 1.75rem 1.75rem;
  background: #000;
  border: 1px solid rgb(200 255 0 / 30%);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgb(0 0 0 / 80%);
  text-align: center;
  animation: beta-rise 0.35s ease-out both;
}

.beta-title {
  margin: 0 0 0.75rem;
  font-family: var(--serif-typeface);
  font-size: 1.5rem;
  color: var(--primary);
}

.beta-message {
  margin: 0 0 1.5rem;
  font-family: var(--sans-serif-typeface);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--light);
  text-wrap: balance;
}

// Same look as the carousel's control buttons. min-height keeps the
// tap target at 44px+ on phones.
.beta-dismiss {
  min-height: 44px;
  padding: 0.5rem 1.75rem;
  background: rgb(200 255 0 / 10%);
  border: 2px solid var(--primary);
  border-radius: 4px;
  color: var(--primary);
  font-family: var(--sans-serif-typeface);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgb(200 255 0 / 20%);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 3px;
  }
}

@keyframes beta-rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .beta-dialog {
    animation: none;
  }
}
</style>
