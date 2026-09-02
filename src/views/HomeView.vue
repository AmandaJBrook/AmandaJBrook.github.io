<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Motion, useScroll, useTransform, useSpring, motionValue } from 'motion-v'
import MainNav from '@/components/MainNav.vue'
import ImageCarousel from '@/components/ImageCarousel.vue'
import paintingArray from '@/data/paintings'
import designArray from '@/data/designs'
import webArray from '@/data/websites'

// ─── Spring config ────────────────────────────────────────────
const SPRING_CONFIG = { stiffness: 60, damping: 20 }

// ─── Background parallax — raw value + smoothed spring ────────
const bgRawOffset = motionValue(0)
const bgSmoothed = useSpring(bgRawOffset, SPRING_CONFIG)

// DOM references — must be `let` so onMounted can assign them
let bgImgEl: HTMLImageElement | null = null
let aboutEl: HTMLElement | null = null
let bgCancelFrame: (() => void) | null = null

// Reactive tracking for viewport height
const viewportHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 0)

let bgMaxTravel: number = 0
let bgScrollEnd: number = 0

// ─── computeBgFactor ──────────────────────────────────────────
// bgMaxTravel is viewport-relative to avoid ResizeObserver feedback loops.
function computeBgFactor(): void {
  if (!aboutEl) return
  bgMaxTravel = viewportHeight.value * 0.4
  bgScrollEnd = aboutEl.offsetTop + aboutEl.offsetHeight
}

// ─── onScroll ─────────────────────────────────────────────────
function onScroll(): void {
  if (!bgScrollEnd) return
  const progress = Math.min(Math.max(window.scrollY / bgScrollEnd, 0), 1)
  bgRawOffset.set(progress * bgMaxTravel)
}

// ─── Window resize handler ────────────────────────────────────
// Using window 'resize' instead of ResizeObserver prevents the feedback
// loop where bgImgEl's translateY causes a body resize → recompute → jitter.
const handleWindowResize = () => {
  viewportHeight.value = window.innerHeight
  computeBgFactor()
  if (bgImgEl) {
    bgImgEl.style.transform = `translateY(${viewportHeight.value * 0.15 - bgSmoothed.get()}px)`
  }
}

// ─── onMounted ────────────────────────────────────────────────
onMounted(() => {
  bgImgEl = document.querySelector<HTMLImageElement>('#parallax-bg img')
  aboutEl = document.querySelector<HTMLElement>('.about')
  if (!aboutEl) return

  viewportHeight.value = window.innerHeight

  if (bgImgEl?.complete) {
    computeBgFactor()
  } else {
    bgImgEl?.addEventListener('load', computeBgFactor, { once: true })
  }

  // 0.15 = 15% of viewport height initial offset. Lower = image starts higher.
  bgCancelFrame = bgSmoothed.on('change', (v) => {
    if (bgImgEl) bgImgEl.style.transform = `translateY(${viewportHeight.value * 0.15 - v}px)`
  })

  window.addEventListener('resize', handleWindowResize)
  window.addEventListener('scroll', onScroll, { passive: true })
})

// ─── onUnmounted ──────────────────────────────────────────────
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', handleWindowResize)
  bgCancelFrame?.()
})

// ─── Header height — shrinks from 100vh → 50vh on scroll ─────
const { scrollY } = useScroll()
const rawHeaderHeight = useTransform(scrollY, [0, 300], ['100vh', '50vh'])
const headerHeight = useSpring(rawHeaderHeight, { stiffness: 80, damping: 20 })

// ─── Header text opacity — fades out on scroll ────────────────
const headerTextOpacity = useTransform(scrollY, [0, 200], [1, 0])

// ─── Foreground and midground figures ─────────────────────────
const aboutRef = ref<HTMLElement | null>(null)

const { scrollYProgress } = useScroll({
  target: aboutRef,
  // 'start end' → 'end start': tracks the section across the full viewport
  // scroll-through so figures rise smoothly rather than snapping at the end.
  offset: ['start end', 'end start'],
})

// Both figures start at 200px so their bottoms are aligned when
// nav-jumping directly to the section. Foreground travels to -30px
// for parallax depth separation on scroll.
const rawMgY = useTransform(scrollYProgress, [0, 1], ['200px', '0px'])
const rawFgY = useTransform(scrollYProgress, [0, 1], ['200px', '-30px'])
const mgY = useSpring(rawMgY, SPRING_CONFIG)
const fgY = useSpring(rawFgY, SPRING_CONFIG)
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

    <!-- FIXED INTERACTIVE CONTAINER: Contains ONLY the menu links -->
    <header class="global-navbar">
      <MainNav />
    </header>

    <!-- SCROLLING HERO VISUAL: Houses the star gif and the fade mask -->
    <Motion as="div" class="hero-visual-stage" :style="{ height: headerHeight }">
      <Motion
        as="h1"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :transition="{ duration: 1 }"
        :style="{ opacity: headerTextOpacity }"
      >
        Amanda Brook
      </Motion>
      <Motion
        as="h2"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :transition="{ duration: 1, delay: 1 }"
        :style="{ opacity: headerTextOpacity }"
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
          :initial="{ opacity: 0, y: -10 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5 }"
          :viewport="{ once: true }"
          >Hello, and welcome</Motion
        >

        <Motion
          as="article"
          class="about-content"
          :initial="{ opacity: 0, y: 0 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.6, delay: 0.15 }"
          :viewport="{ once: true }"
        >
          <picture>
            <source srcset="/images/home/Self-Portrait.webp" type="image/webp" />
            <source srcset="/images/home/Self-Portrait.jpg" type="image/jpg" />
            <img loading="lazy" src="/images/home/Self-Portrait.jpg" alt="Artist's Portrait" />
          </picture>

          <p>
            <em>I'm Amanda.</em><br />
            This website serves as a home for my portfolio and personal projects.
          </p>
          <p id="paragraph--2">
            Please visit the contact section below to get in touch or view my
            <a href="idea-garden.html">Idea Garden</a> for experimental projects and works in
            progress.
          </p>

          <!-- Midground boundary — placed AFTER paragraphs so it only blocks
               text that would spill into the midground zone below.
               Shares mgY so it rises in lockstep with .about-midground.
               shape-outside: url() reads the PNG alpha channel so text wraps
               the midground's actual silhouette edge, not a rectangle. -->
          <Motion as="div" class="midground-boundary" :style="{ y: mgY }" />
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

<style lang="scss">
// ─── Parallax background ──────────────────────────────────────
// VUE CONCEPT: Elements wrapped in <Teleport to="body"> escape Vue's
// component scope. They need a normal global style block like this
// to be styled correctly because Vue cannot inject scoped tracking IDs onto them.

.parallax-stage {
  position: fixed;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}

.parallax-layer {
  position: absolute;
  will-change: transform;

  img {
    display: block;
    pointer-events: none;
  }
}

.parallax-layer-bg {
  inset: 0;
  z-index: 1;
  overflow: hidden;

  // JAVASCRIPT DEPENDENCY: This element has its transform overwritten
  // directly via script (bgSmoothed.on('change')). Do not add standard
  // CSS transitions or transforms here — they will fight the JS updates.
  img {
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    object-position: center top;
    will-change: transform;
  }
}
</style>

<!-- VUE FEATURE: "scoped" ensures these rules only affect this specific file -->
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
  overflow-x: hidden;
}

// ─── Header ───────────────────────────────────────────────────

.global-navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  z-index: 100;
  pointer-events: auto;
  background: transparent;
}

// ─── Hero Visual Stage ────────────────────────────────────────

.hero-visual-stage {
  grid-area: header;
  position: relative;
  width: 100%;
  z-index: 4;
  background: url('/images/home/parallax/stars.gif') center / auto repeat;
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);

  h1 {
    font-family: var(--serif-typeface);
    font-size: 3rem;
    letter-spacing: 0.7rem;
    color: var(--primary);
    text-shadow: 1px 2px 5px #3d3d3d;
    text-align: center;
    text-decoration: none;
    margin: 0;
    padding-bottom: 10px;
    padding-top: 40vh;
  }

  h2 {
    font-family: var(--serif-typeface);
    font-size: 1.8em;
    letter-spacing: 0.15rem;
    color: var(--light);
    text-shadow: 1px 2px 5px #3d3d3d;
    text-align: center;
    text-decoration: none;
    margin: 0;
    padding-bottom: 30px;
    padding-top: 0;
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

.about {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    'about-heading about-heading'
    'about-content about-content';
  align-content: start;
  position: relative;
  min-height: 60vh;

  // Bottom padding reserves space above the midground so text never
  // overlaps it regardless of content length. Tune to midground image height.
  padding: 30px 50px 220px;
  background-color: transparent;
  isolation: isolate;
}

.about-heading {
  grid-area: about-heading;
  align-self: start;
  position: relative;
  z-index: 2;
  margin-bottom: 0;
}

.about-content {
  grid-area: about-content;
  position: absolute;

  // No flex/grid here — floats require a block formatting context to work.
  z-index: 2;

  // Portrait photo — floated left with ellipse shape-outside so text
  // wraps the circular crop rather than the rectangular box.
  img {
    float: left;
    width: 150px;
    padding: 20px;
    border-radius: 50%;
    object-fit: cover;
    shape-outside: ellipse(120px 133px at 49.95% 50.03%);
    -webkit-user-drag: none;
  }

  p {
    font-size: 1em;
    text-align: start;
    text-wrap: balance;
    max-width: 500px;
  }

  // MOTION-V DEPENDENCY: Shares mgY spring with .about-midground so it
  // tracks the midground's vertical position in lockstep.
  // Placed AFTER paragraphs in the DOM so it only affects text that
  // would otherwise spill below into the midground zone.
  // shape-outside: url() reads the PNG alpha for a silhouette-accurate boundary.
  // Tune height until the boundary top aligns with the midground image top edge.
  .midground-boundary {
    float: right;
    clear: right;
    width: 100%;
    height: 40vh;
    shape-outside: url('/images/home/parallax/midground.png');
    pointer-events: none;
  }
}

// MOTION-V DEPENDENCY: Both figures use bottom: 0 to anchor their base position.
// Visual parallax motion is applied entirely via Motion inline style transforms.
.about-midground {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100vw;
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
  width: 25vw;
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
  background-color: black;
  min-height: 50vh;
  will-change: opacity, transform;
  transform: translateZ(0);
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
  background-color: black;
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

@media (width >= 37.5em) {
  .about,
  .portfolio {
    padding: 30px 50px 220px;
  }

  .about {
    min-height: 70vh;
  }

  .about-content img {
    width: 250px;
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

  .midground-boundary {
    height: 35vh;
  }
}

@media (width >= 64em) {
  .about {
    grid-template-columns: 1fr 1fr;
    min-height: 80vh;
  }

  .about-content {
    padding-left: 15vw;
  }

  .about-content img {
    padding-right: 30px;
    float: left;
  }
}
</style>
