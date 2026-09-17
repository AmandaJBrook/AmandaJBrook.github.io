<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Motion, useScroll, useTransform, useSpring } from 'motion-v'
import MainNav from '@/components/MainNav.vue'
import ImageCarousel from '@/components/ImageCarousel.vue'
import paintingArray from '@/data/paintings'
import designArray from '@/data/designs'
import webArray from '@/data/websites'

// ─── Spring config ────────────────────────────────────────────
const SPRING_CONFIG = { stiffness: 60, damping: 20 }

// ─── Header height — shrinks from 100vh → 50vh on scroll ─────
const { scrollY } = useScroll()
const rawHeaderHeight = useTransform(scrollY, [0, 300], ['100vh', '50vh'])
const headerHeight = useSpring(rawHeaderHeight, { stiffness: 80, damping: 20 })

// ─── Header text opacity — fades out on scroll ────────────────
const headerTextOpacity = useTransform(scrollY, [0, 200], [1, 0])

// ─── Background, midground, and foreground figures ──────────
const aboutRef = ref<HTMLElement | null>(null)

const { scrollYProgress } = useScroll({
  target: aboutRef,
  // 1 when .about's bottom reaches the viewport's bottom — i.e. the instant
  // the section's bottom (and the bottom-anchored figures) start coming into view.
  offset: ['start end', 'end end'],
})

// scrollYProgress is a fraction of .about's OWN rendered height (0 = about's
// top touches viewport bottom, 1 = about's bottom touches viewport bottom).
// On narrow/short viewports .about's height is a much larger fraction of the
// viewport, so that whole window is short in real pixels — meaning a fixed
// *fraction* of it (like the old [0, 0.12, 0.45, 1] breakpoints) represents
// wildly different amounts of actual scrolling on different devices. That's
// what was causing the background to already look "arrived" at the top of
// the page on narrow viewports, no matter how large the starting offset was.
//
// Fix: measure .about's real height live, and define the hold/ramp points as
// fixed pixel distances, converting to fractions only at the point of use —
// so "starts easing in 550px before .about ends" means the same 550px of
// scroll on every device.
const aboutHeight = ref(0)
let aboutResizeObserver: ResizeObserver | null = null
onMounted(() => {
  if (aboutRef.value) {
    aboutResizeObserver = new ResizeObserver((entries) => {
      aboutHeight.value = entries[0].contentRect.height
    })
    aboutResizeObserver.observe(aboutRef.value)
  }
})
onBeforeUnmount(() => aboutResizeObserver?.disconnect())

const BG_HOLD_PX = 150 // hold near its starting offset for this many px of scroll
const BG_RAMP_PX = 550 // then ease in over this many px, finishing exactly at about's end

// The background keeps the same .about bottom anchor as the mid/foreground,
// but its start position is viewport-aware so it begins higher in the page
// while still ending aligned to the section bottom.
const bgCurveProgress = useTransform([scrollYProgress], ([p]: number[]) => {
  const h = aboutHeight.value || 1
  const holdFrac = Math.min(BG_HOLD_PX / h, 0.3)
  const rampStartFrac = Math.min(Math.max(1 - BG_RAMP_PX / h, holdFrac + 0.01), 0.95)
  if (p <= holdFrac) return 0
  if (p >= 1) return 1
  if (p <= rampStartFrac) {
    return ((p - holdFrac) / (rampStartFrac - holdFrac)) * 0.8
  }
  return 0.8 + ((p - rampStartFrac) / (1 - rampStartFrac)) * 0.2
})
// Now that the underlying progress curve is pixel-consistent, the large 110%
// starting offset was compensating for the bug rather than reflecting the
// intended composition — you'll likely want to dial this back down (try 70%
// first) once you confirm the creeping/starting-too-low behavior is gone.
const rawBgY = useTransform(bgCurveProgress, [0, 1], ['110%', '0px'])
const rawMgY = useTransform(scrollYProgress, [0, 1], ['200px', '0px'])
const rawFgY = useTransform(scrollYProgress, [0, 1], ['200px', '0px'])
const bgY = useSpring(rawBgY, SPRING_CONFIG)
const mgY = useSpring(rawMgY, SPRING_CONFIG)
const fgY = useSpring(rawFgY, SPRING_CONFIG)
</script>

<template>
  <body class="home-body">
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
      <!-- aboutRef gives Motion's useScroll a target element.
           Z-stack: midground (1) behind content (2) behind foreground (3). -->
      <section class="about" ref="aboutRef">
        <!-- x: '-50%' centers the box (paired with left: 50% in CSS) — this
             has to go through Motion's own style binding rather than a CSS
             transform, because Motion's inline y-transform below would
             otherwise overwrite a separate CSS transform entirely instead
             of merging with it. -->
        <Motion as="div" class="about-background" aria-hidden="true" :style="{ x: '-50%', y: bgY }">
          <img src="/images/home/parallax/background.jpg" alt="" draggable="false" />
        </Motion>

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
    padding-top: 30vh;
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

  // Fluid instead of stepped at breakpoints, so it scales continuously
  // with the vw-based midground/foreground images rather than jumping.
  min-height: clamp(60vh, 55vh + 6vw, 80vh);

  // Bottom padding reserves space above the midground so text never
  // overlaps it regardless of content length. Tune to midground image height.
  padding: 30px 50px 40px;
  background-color: transparent;
  isolation: isolate;

  // Single source of truth shared by .about-content's padding-left and
  // .about-foreground's width (see both below). Deriving one from the other
  // is what guarantees the portrait and foreground always overlap by the
  // same margin at every viewport size, instead of each being sized off an
  // independent guess that only happens to line up at some widths.
  --fg-width: 25vw;
  --portrait-overlap: clamp(15px, 2vw, 40px);
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
  display: flow-root;

  // No flex/grid here — floats require a block formatting context to work.
  z-index: 2;

  // Fluid instead of only kicking in at a 64em breakpoint, so the content
  // shifts right in proportion to .about-foreground's 25vw width at every
  // viewport size instead of snapping over abruptly at one width.
  padding-left: 15vw;

  // Portrait photo — floated left with ellipse shape-outside so text
  // wraps the circular crop rather than the rectangular box.
  img {
    float: left;

    // Fluid instead of stepped at breakpoints, so it scales continuously
    // alongside the vw-based midground/foreground images.
    width: clamp(150px, 14vw, 250px);
    padding: clamp(20px, 2vw, 30px);
    border-radius: 50%;
    object-fit: cover;
    shape-outside: ellipse(90px 110px at 49.95% 50.03%);
    -webkit-user-drag: none;
  }

  p {
    font-size: clamp(1rem, 0.85rem + 0.6vw, 1.2rem);
    text-align: left;
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

    // Fluid instead of stepped at breakpoints, tracking the same vw-based
    // scaling as .about-midground so the wrap boundary stays matched to it.
    height: clamp(35vh, 30vh + 3vw, 40vh);
    shape-outside: url('/images/home/parallax/midground.png');
    pointer-events: none;
  }
}

.about-background {
  position: absolute;
  // Centered via left: 50%, paired with x: '-50%' passed through Motion's
  // style binding in the template (not a CSS transform here — see the
  // comment there for why).
  left: 50%;
  bottom: 0;
  width: 100%;
  // Below 700px this stops shrinking with the viewport and overflows
  // horizontally instead. background.jpg is portrait (aspect-ratio makes
  // height ≈ 1.97× width), so width: 100% alone meant a narrower viewport
  // produced a proportionally SHORTER box — squashing the image on phones.
  // A min-width floor keeps the image at a comfortable size regardless of
  // viewport width. 700px guarantees at least ~40% of it stays visible even
  // at a 320px-wide viewport (320 / 700 ≈ 46%); narrower still, it degrades
  // gracefully rather than hitting a hard cutoff.
  min-width: 700px;
  aspect-ratio: 1640 / 3236;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    -webkit-user-drag: none;
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
    display: block;
    width: 100%;
    height: auto;
    -webkit-user-drag: none;
  }
}

.about-foreground {
  position: absolute;
  left: 0;
  bottom: -3%;
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

// Below 1071px, the portrait's clamp(150px, 14vw, 250px) float stops
// shrinking with the viewport (14vw < 150px), so as the column keeps
// narrowing the fixed-width float eats a growing share of it, squeezing
// text into more and more wrapped lines. That inflates .about-content's
// (and therefore .about's) height, which pushes the bottom-anchored
// .about-background further down the page the narrower the screen gets.
// Un-floating the portrait below 600px removes that squeeze.
@media (width < 37.5em) {
  .about-content {
    padding-left: 0;

    img {
      float: none;
      display: block;
      margin: 0 auto clamp(15px, 4vw, 25px);
      shape-outside: none;
    }

    .midground-boundary {
      // No floated text left to guard against below this width.
      display: none;
    }
  }
}

@media (width >= 37.5em) {
  .portfolio {
    padding: 30px 50px 220px;
  }

  .anchor p {
    font-size: 1.1rem;
    width: 80%;
  }
}
</style>
