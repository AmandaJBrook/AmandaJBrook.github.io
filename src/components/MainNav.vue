<template>
  <nav class="site-nav">
    <!-- Hamburger button for mobile that toggles main navigation and is hidden on desktop -->
    <button
      class="hamburger icon"
      @click="isMobileMenuOpen = !isMobileMenuOpen"
      :aria-expanded="isMobileMenuOpen"
      aria-label="Toggle menu"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Logo that links to home -->
    <a href="/" class="logo">
      <figure>
        <img src="/images/Logo.png" alt="Amanda Brook Design Logo" />
      </figure>
    </a>

    <!-- Main navigation that is hidden on mobile -->
    <menu id="myNav" :class="{ responsive: isMobileMenuOpen }">
      <li><a href="#portfolio" @click="isMobileMenuOpen = false">portfolio</a></li>
      <li><a href="#about" @click="isMobileMenuOpen = false">about</a></li>
      <li><a href="#contact" @click="isMobileMenuOpen = false">contact</a></li>
    </menu>
  </nav>
</template>
<!-- This component is responsible for rendering the main navigation bar, including the logo and the
hamburger menu for mobile devices. It uses a reactive variable to toggle the visibility of the menu
on smaller screens. The navigation links are set up to close the menu when clicked, ensuring asmooth user experience on mobile devices. -->
<script setup>
import { ref } from 'vue'
// Reactive variable to track whether the mobile menu is open or closed
const isMobileMenuOpen = ref(false)
</script>

<style scoped>
.site-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hamburger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.hamburger span {
  display: block;
  width: 25px;
  height: 3px;
  background: black;
  margin: 5px 0;
  transition: 0.3s;
}

menu {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 1.5rem;
}
/* Mobile styles */
@media (max-width: 768px) {
  .hamburger {
    display: block;
  }

  menu {
    position: absolute;
    flex-direction: column;
    top: 60px;
    right: 0;
    left: 0;
    background: white;
    padding: 1rem;
    gap: 0;
  }

  menu:not(.responsive) {
    display: none;
  }
}
</style>
