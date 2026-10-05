<!-- This component is responsible for rendering the main navigation bar, including the logo and the
hamburger menu for mobile devices. It uses a reactive variable to toggle the visibility of the menu
on smaller screens. The navigation links are set up to close the menu when clicked, ensuring a smooth user experience on mobile devices. -->
<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

// ─── Nav link shape ───────────────────────────────────────────
// 'anchor'   — same-page hash link, uses smoothScroll
// 'external' — off-site link, closes mobile menu on click
// 'router'   — internal route, uses RouterLink
type NavLinkType = 'anchor' | 'external' | 'router'

interface NavLink {
  label: string
  href: string
  type: NavLinkType
}

// Reactive variable to track whether the mobile menu is open or closed
const isMobileMenuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const menuHeight = ref(0)
const windowWidth = ref(window.innerWidth)

// Compute nav height based on menu state (only on mobile)
const navHeight = computed(() => {
  const isMobile = windowWidth.value <= 768
  if (isMobile && isMobileMenuOpen.value && menuHeight.value > 0) {
    return `${60 + menuHeight.value + 20}px`
  }
  return '60px'
})

watch(isMobileMenuOpen, async (newVal) => {
  if (newVal) {
    await nextTick()
    if (menuRef.value) {
      menuHeight.value = menuRef.value.scrollHeight
    }
  } else {
    menuHeight.value = 0
  }
})

/**
 * Handles window resize event, updating windowWidth and closing the mobile menu if the window width exceeds 768px.
 */
const handleResize = () => {
  windowWidth.value = window.innerWidth
  if (windowWidth.value > 768) {
    isMobileMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Nav height is always 60px in its final resting state — used as
// the scroll offset so anchor targets aren't hidden behind the nav.
const NAV_HEIGHT = 60

/* Smoothly scrolls to the target element when a nav link is clicked.
 *
 * getBoundingClientRect() reads the element's position in the current
 * viewport at click time — after the header spring has settled —
 * then converts it to a document-absolute Y by adding window.scrollY.
 * Subtracting NAV_HEIGHT ensures the section's top padding lands flush
 * below the nav bar rather than behind it.
 */
const smoothScroll = (e: MouseEvent) => {
  const target = e.target as HTMLAnchorElement
  const href = target.getAttribute('href')
  if (!href || !href.startsWith('#')) return
  e.preventDefault()

  const el = document.querySelector<HTMLElement>(href)
  if (!el) return

  const stableAncestor = el.closest<HTMLElement>('section, article, main, footer') ?? el

  // The hero-visual-stage springs from 100vh → 50vh as the user scrolls.
  // By the time we've scrolled to .about, it will have fully collapsed.
  // If we're currently at the top (hero not yet collapsed), we must subtract
  // the ~50vh it will shed so our target lands correctly after the layout shift.
  const heroEl = document.querySelector<HTMLElement>('.hero-visual-stage')
  const heroCollapse = heroEl ? heroEl.getBoundingClientRect().height - window.innerHeight * 0.5 : 0

  const rect = stableAncestor.getBoundingClientRect()
  const targetY = rect.top + window.scrollY - NAV_HEIGHT - Math.max(0, heroCollapse)

  window.scrollTo({ top: targetY, behavior: 'smooth' })
}
/* Handles a nav link click event, smoothly scrolling to the target element and closing the mobile menu.
 */
const handleNavClick = (e: MouseEvent) => {
  smoothScroll(e)
  isMobileMenuOpen.value = false
}

withDefaults(
  defineProps<{
    links?: NavLink[]
  }>(),
  {
    links: () => [
      { label: 'about', href: '#about', type: 'anchor' as NavLinkType },
      { label: 'portfolio', href: '/portfolio', type: 'router' as NavLinkType },
      { label: 'contact', href: '#contact', type: 'anchor' as NavLinkType },
    ],
  },
)
</script>

<template>
  <nav class="site-nav" :style="{ height: navHeight }">
    <button
      class="hamburger icon"
      :class="{ open: isMobileMenuOpen }"
      @click="isMobileMenuOpen = !isMobileMenuOpen"
      :aria-expanded="isMobileMenuOpen"
      aria-label="Toggle menu"
    >
      <svg viewBox="0 0 25 3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="25" height="3" />
      </svg>
      <svg viewBox="0 0 25 3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="25" height="3" />
      </svg>
      <svg viewBox="0 0 25 3" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="25" height="3" />
      </svg>
    </button>

    <div class="views-group">
      <RouterLink :to="{ name: 'oracle' }" class="card-icon" aria-hidden="true">
        <svg class="card card-back" viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="38" height="58" rx="3" ry="3" />
        </svg>
        <svg class="card card-mid" viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="38" height="58" rx="3" ry="3" />
        </svg>
        <svg class="card card-front" viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="38" height="58" rx="3" ry="3" />
        </svg>
      </RouterLink>

      <RouterLink :to="{ name: 'home' }" class="logo">
        <img src="/images/Logo.png" alt="Amanda Brook Design Logo" />
      </RouterLink>
    </div>

    <menu ref="menuRef" :class="{ responsive: isMobileMenuOpen }">
      <li v-for="link in links" :key="link.href">
        <template v-if="link.type === 'anchor'">
          <a :href="link.href" @click="smoothScroll" class="nav-link">{{ link.label }}</a>
        </template>
        <template v-else-if="link.type === 'external'">
          <a :href="link.href" @click="handleNavClick" class="nav-link">{{ link.label }}</a>
        </template>
        <template v-else>
          <RouterLink :to="link.href" @click="isMobileMenuOpen = false" class="nav-link">{{
            link.label
          }}</RouterLink>
        </template>
      </li>
    </menu>
  </nav>
</template>

<style scoped>
nav {
  grid-area: nav;
  display: grid;
  position: fixed;
  grid-template: 'hamburger views-group' 60px 'menu menu' auto / auto 1fr;
  background-color: var(--glass);
  backdrop-filter: blur(10px);
  width: 100vw;
  z-index: 100;
  top: 0;
  left: 0;
  right: 0;
  transition: height 0.3s ease-in;
}

.hamburger {
  grid-area: hamburger;
  display: none;
  flex-direction: column;
  gap: 5px;
  place-self: start;
  box-sizing: border-box;
  height: 60px;
  padding: 20px 1rem 21px;
  background: none;
  border: none;
  cursor: pointer;
}

.hamburger svg {
  display: block;
  width: 25px;
  height: 3px;
  margin: 0;
  transition: 0.3s;
}

.hamburger svg rect {
  fill: var(--light);
  transition: fill 0.3s;
}

.hamburger.open svg rect {
  fill: var(--primary);
}

.hamburger.open svg:nth-child(2) {
  transform: scaleX(0);
  opacity: 0;
}

.hamburger.open svg:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.hamburger.open svg:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

.views-group {
  grid-area: views-group;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 20px;
}

.logo {
  z-index: 2;

  img {
    display: block;
    width: 60px;
    padding: 0.55rem;
  }
}

/* ── Oracle Card Icon ─────────────────────────────────────── */
.card-icon {
  position: relative;
  width: 25px;
  height: 38px;
  margin: 0 0.25rem;
  cursor: pointer;
  flex-shrink: 0;
}

.card {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform-origin: bottom left;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card rect {
  fill: var(--glass, #1a1a2e);
  stroke: var(--primary, #c9a96e);
  stroke-width: 1.5;
}

.card-back,
.card-mid {
  transform: rotate(0deg);
  opacity: 1;
}

.card-icon:hover .card-back {
  transform: rotate(20deg);
}

.card-icon:hover .card-mid {
  transform: rotate(10deg);
}

.card-icon:hover .card-front {
  transform: translateY(-2px);
}

/* ── Menu ─────────────────────────────────────────────────── */
menu {
  display: flex;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 1.5rem;
  grid-area: menu;
  opacity: 1;
  visibility: visible;
  transition:
    opacity 0.3s ease-in,
    visibility 0.1s ease-in;
}

.nav-link {
  font-family: var(--serif-typeface), sans-serif;
  font-size: 1.2em;
  letter-spacing: 0.3rem;
  text-decoration: none;
  color: var(--light);
  text-shadow:
    0 2px 3px rgb(0 0 0 / 100%),
    0 4px 13px rgb(0 0 0 / 50%),
    0 8px 23px rgb(0 0 0 / 20%);
  transition: color 0.3s ease;
}

.nav-link:link,
.nav-link:visited {
  color: var(--light);
}

.nav-link:hover,
.nav-link:active {
  color: var(--primary);
}

/* Desktop styles */
@media (width > 768px) {
  nav {
    grid-template: 'views-group menu' 60px / auto 1fr;
  }

  .hamburger {
    display: none;
  }

  .views-group {
    justify-content: flex-start;
    flex-direction: row-reverse;
    gap: 10px;
    padding: 0 10px;
  }

  menu {
    flex-direction: row;
    justify-content: flex-end;
    padding-right: 20px;
  }
}

/* Mobile styles */
@media (width <= 768px) {
  .hamburger {
    display: flex;
  }

  menu {
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    gap: 0;
  }

  menu:not(.responsive) {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }

  menu.responsive {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    justify-content: center;
  }
}
</style>
