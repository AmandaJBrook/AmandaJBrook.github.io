<script setup>
import MainNav from '@/components/MainNav.vue'
import ImageCarousel from '@/components/ImageCarousel.vue'
import paintingArray from '@/data/paintings.js'
import designArray from '@/data/designs.js'
import webArray from '@/data/websites.js'
</script>

<template>
  <body class="home-body">
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
  </body>
</template>

<style scoped lang="scss">
.home-body {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas:
    'header'
    'main'
    'footer';
  background-image:
    url('/images/Banner.jpg'),
    linear-gradient(to bottom, color(srgb 0.129 0.173 0.208) 40%, color(srgb 0 0 0) 100%);
  background-position: top, bottom;
  background-size:
    100% auto,
    100%;
  background-blend-mode: lighten;
  background-repeat: no-repeat;
}

header {
  grid-area: header;
  height: 100vh;
  z-index: 3;
}

.gallery-container {
  grid-area: main;
}

/* Section Padding */
.about,
.portfolio,
.contact {
  padding: 30px 50px;
}

/* About Section */
.about {
  display: inline-block;
  overflow: auto;
  margin-bottom: 60px;
}

.about img {
  float: right;
  width: 150px;
  border-radius: 50%;
  object-fit: cover;
  shape-outside: ellipse(147px 188px at 49.95% 50.03%);
}

.about p {
  font-size: 1em;
  text-align: start;
  text-wrap: balance;
  max-width: 500px;
  position: relative;
}

/* Footer Styles */
footer {
  grid-area: footer;
  display: inline-block;
  width: 100%;
  z-index: -1;
  margin: 0 auto;
  padding: 30px 0;
}

footer p {
  text-align: center;
  position: static;
  font-size: 110%;
  width: 100%;
  height: 30px;
  padding: 0;
  padding-bottom: 50px;
}

footer a {
  display: none;
}

/* Responsive Media Queries - Mobile First */

/* Tablet and up (37.5em = 600px) */
@media (width >= 37.5em) {
  .about,
  .portfolio,
  .contact {
    padding: 30px 50px;
  }

  .about img {
    width: 300px;
    float: left;
  }

  .about p {
    font-size: 1.2em;
    left: 50px;
    text-align: left;
  }

  .anchor p {
    font-size: 1.1rem;
    width: 80%;
  }
}

/* Desktop and up (64em = 1024px) */
@media (width >= 64em) {
  .about .flex-container {
    display: flex;
  }
}
</style>
