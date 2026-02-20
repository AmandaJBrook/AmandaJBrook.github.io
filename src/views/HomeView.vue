<script setup>
import MainNav from '@/components/MainNav.vue'
import ImageCarousel from '@/components/ImageCarousel.vue'
import paintingArray from '@/data/paintings.js'
import designArray from '@/data/designs.js'
import webArray from '@/data/websites.js'
import '@/styles/main.scss'
</script>

<template>
  <header>
    <!-- Top Navigation -->
    <MainNav />
    <!-- Title -->
    <h1>AMANDA BROOK</h1>
    <h2>art and design</h2>
  </header>
  <main class="grid-main">
    <!-- Portfolio Gallery -->
    <section class="portfolio">
      <h1 class="anchor" id="portfolio">PORTFOLIO</h1>
      <main class="gallery-container">
        <p>Painting and Illustration</p>
        <ImageCarousel :items="paintingArray" category="painting" />

        <p>Graphic Design</p>
        <ImageCarousel :items="designArray" category="design" />

        <p>Web Design and Development</p>
        <ImageCarousel :items="webArray" category="website" />
      </main>
    </section>
    <!-- About -->
    <section class="about">
      <h1 class="anchor" id="about">ABOUT</h1>
      <article>
        <picture>
          <source srcset="/images/Self-Portrait.webp" type="image/webp" />
          <source srcset="/images/Self-Portrait.jpg" type="image/jpg" />
          <img loading="lazy" src="/images/Self-Portrait.jpg" alt="Artist's Portrait" />
        </picture>
        <p>
          <em>Hello, I'm Amanda.</em><br />
          This website is serves as a portfolio for my work as well as a developer's playground.
        </p>
        <p id="paragraph--2">
          Please visit the contact section below to get in touch or view my
          <a href="idea-garden.html">Idea Garden</a> for experimental projects and works in
          progress.
        </p>
      </article>
    </section>
  </main>
  <!-- Contact and Footer -->
  <footer>
    <h1 class="anchor" id="contact">CONTACT</h1>
    <div class="footer">
      <p>amandajbrook.contact@gmail.com</p>
      <a href="idea-garden.html">Idea Garden</a>
    </div>
  </footer>
</template>
