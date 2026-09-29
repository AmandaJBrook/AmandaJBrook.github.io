<script setup lang="ts">
import MainNav from '@/components/MainNav.vue'
import ImageCarousel from '@/components/ImageCarousel.vue'
import paintingArray from '@/data/paintings'
import designArray from '@/data/designs'
import webArray from '@/data/websites'
</script>

<template>
  <div class="portfolio-shell">
    <header class="global-navbar">
      <MainNav
        :links="[
          { label: 'home', href: '/', type: 'router' },
          { label: 'oracle', href: '/oracle', type: 'router' },
        ]"
      />
    </header>

    <main class="portfolio-page">
      <section class="portfolio">
        <h1 class="anchor" id="portfolio">PORTFOLIO</h1>

        <main class="gallery-container">
          <p class="gallery-label">Painting and Illustration</p>
          <ImageCarousel :items="paintingArray" category="painting" />

          <p class="gallery-label">Graphic Design</p>
          <ImageCarousel :items="designArray" category="design" />

          <p class="gallery-label">Web Design and Development</p>
          <ImageCarousel :items="webArray" category="website" />
        </main>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
.portfolio-shell {
  background: black;
  min-height: 100vh;
}

.global-navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  z-index: 100;
  pointer-events: auto;
  background: transparent;
}

.portfolio-page {
  min-height: 100vh;
  background: black;
  padding-top: 5rem;
}

.portfolio {
  padding: 30px 50px;
  background-color: black;
  min-height: 50vh;
  max-width: 100%;
  overflow-x: clip;
  box-sizing: border-box;
}

.gallery-container {
  display: grid;
  gap: 2rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.gallery-container p,
.gallery-label {
  margin: 0;
  padding: 0;
  font-size: clamp(1.1rem, 1rem + 0.5vw, 1.5rem);
  letter-spacing: 0.08rem;
  color: var(--light);
  text-align: center;
  text-wrap: balance;
}

@media (width <= 37.5em) {
  .portfolio {
    padding: 30px 1rem;
  }
}
</style>
