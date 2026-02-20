<!-- This component is responsible for rendering the main navigation bar, including the logo and the
hamburger menu for mobile devices. It uses a reactive variable to toggle the visibility of the menu
on smaller screens. The navigation links are set up to close the menu when clicked, ensuring a smooth user experience on mobile devices. -->
<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

// Reactive variable to track whether the mobile menu is open or closed
const isMobileMenuOpen = ref(false)
const menuRef = ref(null)
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

const smoothScroll = (e) => {
  e.preventDefault()
  const target = document.querySelector(e.target.getAttribute('href'))
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleNavClick = (e) => {
  smoothScroll(e)
  isMobileMenuOpen.value = false
}
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
      <span></span>
      <span></span>
      <span></span>
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
      <li>
        <a href="#portfolio" @click="handleNavClick" class="nav-link">portfolio</a>
      </li>
      <li>
        <a href="#about" @click="handleNavClick" class="nav-link">about</a>
      </li>
      <li>
        <a href="#contact" @click="handleNavClick" class="nav-link">contact</a>
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
  place-self: center start;
  padding: 1rem;
  background: none;
  border: none;
  cursor: pointer;
}

.hamburger span {
  display: block;
  width: 25px;
  height: 3px;
  background: var(--light);
  margin: 5px 0;
  transition: 0.3s;
}

.hamburger.open span {
  background: var(--primary);
}

.hamburger.open span:nth-child(2) {
  transform: scaleX(0);
  opacity: 0;
}

.hamburger.open span:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.hamburger.open span:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

.views-group {
  grid-area: views-group;
  display: flex;
  align-items: center;
  justify-content: flex-end;
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
    display: block;
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
  }
}
</style>
