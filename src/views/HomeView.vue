<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Motion, useScroll, useTransform, useSpring, motionValue } from 'motion-v'
import MainNav from '@/components/MainNav.vue'
import ImageCarousel from '@/components/ImageCarousel.vue'
import paintingArray from '@/data/paintings.js'
import designArray from '@/data/designs.ts'
import webArray from '@/data/websites.js'

// ─── Background — manual log curve smoothed via Motion spring ──
// The log curve can't be expressed with useTransform, so we keep the
// math in JS. To smooth it we pipe the raw offset through a motionValue
// and a spring, then read the spring output each animation frame and
// write it to the DOM — giving the background the same trailing ease
// as the midground without losing the custom curve shape.

const BG_EXP = 2.5

// Shared spring config — all parallax layers use this so they feel
// physically consistent. Tune here and all layers update together.
const SPRING_CONFIG = { stiffness: 60, damping: 20 }

const bgRawOffset = motionValue(0)
const bgSmoothed = useSpring(bgRawOffset, SPRING_CONFIG)

let bgImgEl: HTMLImageElement | null = null
let aboutEl: HTMLElement | null = null
let bgFactor: number | null = null
let bgCancelFrame: (() => void) | null = null

function onScroll() {
  if (!bgFactor) return
  const offset = Math.log(window.scrollY + 1) ** BG_EXP * bgFactor
  bgRawOffset.set(offset)
}

onMounted(() => {
  bgImgEl = document.querySelector<HTMLImageElement>('#parallax-bg img')
  aboutEl = document.querySelector<HTMLElement>('.about')
  if (!aboutEl) return

  const sectionBottom = aboutEl.offsetTop + aboutEl.offsetHeight
  const availableTravel = window.innerHeight * 3
  bgFactor = availableTravel / Math.log(sectionBottom + 1) ** BG_EXP

  // Write the spring's smoothed value to the DOM on every animation frame.
  // frame.update is Motion's rAF scheduler — avoids a manual requestAnimationFrame loop.
  bgCancelFrame = bgSmoothed.on('change', (v) => {
    if (bgImgEl) bgImgEl.style.transform = `translateY(${-v}px)`
  })

  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  bgCancelFrame?.()
})

// ─── Header height — shrinks from 100vh → 50vh on scroll ─────
// useScroll with no target tracks the page-level scrollY.
// useTransform clamps the input [0, 300] px → output ['100vh', '50vh'].
// 300px of scroll is enough to complete the transition before the
// about section enters view, giving the user a quicker path to it.
// useSpring wraps the transform for a natural ease-out feel.

const { scrollY } = useScroll()
const rawHeaderHeight = useTransform(scrollY, [0, 300], ['100vh', '50vh'])
const headerHeight = useSpring(rawHeaderHeight, { stiffness: 80, damping: 20 })

// ─── Figures — Motion useScroll + useTransform ────────────────
// useScroll tracks scroll progress through the about section.
// target is set in onMounted once the ref resolves.
// offset: ['end end', 'start start'] means:
//   0 = when the section's bottom hits the viewport's bottom (entering)
//   1 = when the section's top hits the viewport's top (leaving)

const aboutRef = ref<HTMLElement | null>(null)

const { scrollYProgress } = useScroll({
  target: aboutRef,
  offset: ['end end', 'start start'],
})

// Figures start below (positive translateY) and rise to 0 as progress → 1.
// Midground travels 120px, foreground 200px — foreground rises faster.
// useSpring wraps each transform so they trail scroll with the same
// physical feel as the background — all using SPRING_CONFIG.
const rawMgY = useTransform(scrollYProgress, [0, 1], ['120px', '0px'])
const rawFgY = useTransform(scrollYProgress, [0, 1], ['200px', '0px'])
const mgY = useSpring(rawMgY, SPRING_CONFIG)
const fgY = useSpring(rawFgY, SPRING_CONFIG)

// ─── Text boundary — tracks midground rise ────────────────────
// Directly mirrors mgY with no spring — the boundary moves in exact
// lockstep with the midground so the text reflows in sync.
const boundaryMarginTop = useTransform(scrollYProgress, [0, 1], ['120px', '0px'])
</script>

<template>
  <body class="home-body">
    <!-- Parallax background — teleported to <body> so position: fixed
         resolves against the viewport, not the #app stacking context.
         Scoped styles cannot reach teleported elements — see :global()
         blocks in <style>. -->
    <Teleport to="body">
      <div class="parallax-stage" aria-hidden="true">
        <div id="parallax-bg" class="parallax-layer parallax-layer-bg">
          <img src="/images/home/parallax/background.jpg" alt="" />
        </div>
      </div>
    </Teleport>

    <Motion as="header" :style="{ height: headerHeight }">
      <MainNav />
      <Motion
        as="h1"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :transition="{ duration: 1 }"
      >
        Amanda Brook
      </Motion>
      <Motion
        as="h2"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :transition="{ duration: 1, delay: 1 }"
      >
        Art and Design
      </Motion>
    </Motion>

    <main class="grid-main">
      <!-- ref="aboutRef" gives Motion's useScroll a target element.
           Z-stack: midground (1) behind content (2) behind foreground (3). -->
      <section class="about" ref="aboutRef">
        <!-- whileInView fades the heading in as it enters the viewport.
             once: true means it only animates on the first scroll past. -->
        <Motion
          as="h1"
          class="about-heading anchor"
          id="about"
          :initial="{ opacity: 0, y: -20 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5 }"
          :viewport="{ once: true }"
          >ABOUT</Motion
        >

        <Motion
          as="article"
          class="about-content"
          :initial="{ opacity: 0, y: 30 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.6, delay: 0.15 }"
          :viewport="{ once: true }"
        >
          <picture>
            <source srcset="/images/home/Self-Portrait.webp" type="image/webp" />
            <source srcset="/images/home/Self-Portrait.jpg" type="image/jpg" />
            <img loading="lazy" src="/images/home/Self-Portrait.jpg" alt="Artist's Portrait" />
          </picture>
          <!-- the text will use this to seem to flow around the midground image. must come before the text to wrap -->
          <!-- marginTop is driven by the same scrollYProgress as mgY so the
               shape-outside boundary tracks the midground's rise in real time,
               causing the text to reflow in sync with the parallax. -->
          <Motion
            as="div"
            class="midground-text-boundary"
            :style="{ marginTop: boundaryMarginTop }"
          />
          <p>
            <em>Hello, I'm Amanda.</em><br />
            This website serves as a portfolio for my work as well as a developer's playground.
          </p>
          <p id="paragraph--2">
            Please visit the contact section below to get in touch or view my
            <a href="idea-garden.html">Idea Garden</a> for experimental projects and works in
            progress.
          </p>
        </Motion>

        <!-- Figures driven by Motion useTransform — style bound to mgY/fgY.
             Motion applies translateY reactively as scrollYProgress updates. -->
        <Motion as="div" class="about-midground" aria-hidden="true" :style="{ y: mgY }">
          <img src="/images/home/parallax/midground.png" alt="" draggable="false" />
        </Motion>

        <Motion as="div" class="about-foreground" aria-hidden="true" :style="{ y: fgY }">
          <img src="/images/home/parallax/foreground.png" alt="" draggable="false" />
        </Motion>
      </section>

      <!-- Portfolio section fades in as it enters the viewport. -->
      <Motion
        as="section"
        class="portfolio"
        :initial="{ opacity: 0 }"
        :while-in-view="{ opacity: 1 }"
        :transition="{ duration: 0.6 }"
        :viewport="{ once: true }"
      >
        <h1 class="anchor" id="portfolio">PORTFOLIO</h1>
        <main class="gallery-container">
          <p>Painting and Illustration</p>
          <ImageCarousel :items="paintingArray" category="painting" />

          <p>Graphic Design</p>
          <ImageCarousel :items="designArray" category="design" />

          <p>Web Design and Development</p>
          <ImageCarousel :items="webArray" category="website" />
        </main>
      </Motion>
    </main>

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
  background-color: color(srgb 10% 12% 17%);
  position: relative;

  // Clips horizontal overflow from absolutely-positioned elements like
  // .about-midground without creating a scroll container on any child.
  overflow-x: hidden;
}

// ─── Parallax background ──────────────────────────────────────
// :global() required — teleported elements are outside the scoped
// component root and do not receive the scoped attribute.

:global(.parallax-stage) {
  position: fixed;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}

:global(.parallax-layer) {
  position: absolute;
  will-change: transform;

  img {
    display: block;
    -webkit-user-drag: none;
    pointer-events: none;
  }
}

:global(.parallax-layer-bg) {
  inset: 0;
  z-index: 1;
  overflow: hidden;

  img {
    // Width matches the viewport exactly — no horizontal overflow.
    // Height is taller than the viewport so translateY has room to
    // shift the image upward without exposing the page background below.
    // 150vh = enough travel for the log curve across the full about section.
    // Increase if the image bottom becomes visible at deep scroll depths.
    width: 100vw;
    height: 150vh;
    object-fit: scale-down;
    object-position: 50% 0%;

    // translateY is applied by the scroll listener
    will-change: transform;
  }
}

// ─── Header ───────────────────────────────────────────────────

header {
  grid-area: header;
  position: relative;
  z-index: 4;
  background: transparent;

  // height is driven by Motion useTransform (100vh → 50vh on scroll)
  // do not set a fixed height here or it will override the inline style

  h1 {
    padding-top: 40vh;
  }
}

// ─── Grid main ────────────────────────────────────────────────

.grid-main {
  position: relative;
  z-index: 3;
}

.gallery-container {
  grid-area: main;
}

// ─── About ────────────────────────────────────────────────────
// Grid handles heading and content only.
// Figures are position: absolute — bound to the section visually
// and structurally, but translated independently by the scroll listener.
// Z-index stack (isolation: isolate scopes these to the section):
//   1  about-midground  — behind content
//   2  about-content    — text + portrait
//   3  about-foreground — in front of everything

.about {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    'about-heading about-heading'
    'about-content about-content';
  position: relative;
  min-height: 80vh;
  padding: 30px 50px;
  background-color: transparent;
  isolation: isolate;
}

.about-heading {
  grid-area: about-heading;
  position: relative;
  z-index: 2;
}

.about-content {
  grid-area: about-content;
  position: relative;
  z-index: 2;

  img {
    float: right;
    width: 150px;
    border-radius: 50%;
    object-fit: cover;
    shape-outside: ellipse(137px 168px at 49.95% 50.03%);
    -webkit-user-drag: none;
  }

  p {
    font-size: 1em;
    text-align: start;
    text-wrap: balance;
    max-width: 500px;
  }

  .midground-text-boundary {
    float: right;
    width: 50%;
    height: 50vh;
    z-index: 3;

    /*
    Points Swapped:
    1. 100% 0%   - New Roof Peak (Now on the far right)
    2. 100% 100% - Bottom Right
    3. 0% 100%   - Bottom Left (Bushes jutting out)
    4. 20% 70%   - Above the bushes
    5. 20% 40%   - Left Eave (The roof now slopes from 100% down to here)
  */
    shape-outside: polygon(100% 0%, 100% 100%, 0% 100%, 20% 70%, 20% 40%);
    clip-path: polygon(100% 0%, 100% 100%, 0% 100%, 20% 70%, 20% 40%);
    margin-left: 0; /* Buffer so text doesn't touch the "bushes" */
  }
}

// Figures start at the bottom of the section (top: 100%) and are
// translated upward by the scroll listener as the section enters view.
// will-change: transform promotes each to its own GPU layer.

// Both figures use bottom: 0 so their baselines sit on the same
// horizontal line regardless of their different heights.
// A large initial translateY in the JS (top: 100% equivalent) pushes
// them below the section on load — the scroll listener animates them up.

// will-change removed — Motion manages GPU layer promotion internally.
.about-midground {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  z-index: 1;

  img {
    width: 100%;
    height: auto;
    -webkit-user-drag: none;
  }
}

.about-foreground {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 20vw;
  z-index: 3;

  img {
    width: 100%;
    height: auto;
    -webkit-user-drag: none;
  }
}

// ─── Portfolio ────────────────────────────────────────────────

.portfolio {
  padding: 30px 50px;
  background-color: transparent;
  min-height: 50vh;
}

// ─── Footer ───────────────────────────────────────────────────

footer {
  grid-area: footer;
  display: inline-block;
  width: 100%;
  position: relative;
  z-index: 3;
  margin: 0 auto;
  padding: 30px 0;
  background-color: transparent;
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

// ─── Responsive ───────────────────────────────────────────────

// Tablet (~600px)
@media (width >= 37.5em) {
  .about,
  .portfolio {
    padding: 30px 50px;
  }

  .about-content img {
    width: 250px;
    float: left;
    padding: 30px;
  }

  .about-content p {
    font-size: 1.2em;
    text-align: left;
  }

  .anchor p {
    font-size: 1.1rem;
    width: 80%;
  }
}

// Desktop (~1024px)
@media (width >= 64em) {
  .about {
    grid-template-columns: 1fr 1fr;
  }

  .about-content img {
    padding: 30px;
  }
}
</style>
