<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Motion, useScroll, useTransform, useSpring } from 'motion-v'
import MainNav from '@/components/MainNav.vue'

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
        <div class="about-content">
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

          <picture class="about-portrait">
            <source srcset="/images/home/portrait.webp" type="image/webp" />
            <source srcset="/images/home/portrait.jpg" type="image/jpg" />
            <img loading="lazy" src="/images/home/portrait.jpg" alt="Artist's Portrait" />
          </picture>

          <Motion
            as="article"
            class="about-text"
            :initial="{ opacity: 0 }"
            :while-in-view="{ opacity: 1 }"
            :transition="{ duration: 0.6, delay: 0.15 }"
            :viewport="{ once: true }"
          >
            <p>
              <em>I'm Amanda.</em><br />
              This website serves as a home for my portfolio and personal projects.
            </p>
            <p id="paragraph--2">
              Please click the house below to enter my portfolio, or play with my experimental
              oracle card deck by clicking the card in the navigation bar above. I will be updating
              digital art thoughout the site over time, so please check back often!
            </p>
          </Motion>
        </div>

        <!-- x: '-50%' centers the box (paired with left: 50% in CSS) — this
             has to go through Motion's own style binding rather than a CSS
             transform, because Motion's inline y-transform below would
             otherwise overwrite a separate CSS transform entirely instead
             of merging with it. -->
        <Motion as="div" class="about-background" aria-hidden="true" :style="{ x: '-50%', y: bgY }">
          <img src="/images/home/parallax/background.jpg" alt="" draggable="false" />
        </Motion>

        <!-- Figures driven by Motion useTransform — style bound to mgY/fgY.
             Motion applies translateY reactively as scrollYProgress updates. -->
        <Motion as="div" class="about-midground" aria-hidden="true" :style="{ y: mgY }">
          <img src="/images/home/parallax/midground.webp" alt="" draggable="false" />
        </Motion>

        <!-- NOTE: aria-hidden lives on the individual decorative images below,
             not on this wrapper — the portrait img nested inside carries real
             alt text, and aria-hidden on an ancestor would hide its whole
             subtree from assistive tech regardless of the descendant's own
             alt/aria-hidden. -->
        <Motion as="div" class="about-foreground" :style="{ y: fgY }">
          <img
            src="/images/home/parallax/foreground.webp"
            alt=""
            aria-hidden="true"
            draggable="false"
          />

          <img
            class="about-tree"
            src="/images/home/parallax/tree.webp"
            alt=""
            aria-hidden="true"
            draggable="false"
          />
        </Motion>
      </section>
    </main>

    <footer>
      <h1 class="anchor" id="contact">CONTACT</h1>
      <div class="footer">
        <a
          class="footer-linkedin"
          href="https://www.linkedin.com/in/amanda-brook-445139406/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/images/home/linkedin-app-icon.png"
            alt="Amanda Brook on LinkedIn"
            loading="lazy"
            draggable="false"
          />
        </a>
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
  background-color: color(srgb 7% 7% 7%);
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
    padding: 30vh 20px 10px;
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

// ─── About ────────────────────────────────────────────────────

.about {
  position: relative;

  // Fluid instead of stepped at breakpoints, so it scales continuously
  // with the vw-based midground/foreground images rather than jumping.
  // This also sets how much scroll distance the parallax animation gets
  // (useScroll measures progress across .about's own height) — the max
  // was 200vh back when the portfolio section directly followed and
  // could absorb that scroll length; with nothing following it now,
  // 200vh left a long stretch of empty space before the footer.
  min-height: clamp(120vh, 60vh + 90vw, 150vh);

  // Bottom padding reserves space above the midground so text never
  // overlaps it regardless of content length. Tune to midground image height.
  padding: 30px 50px 40px;
  background-color: transparent;
  isolation: isolate;

  // Single source of truth for .about-foreground's width — everything
  // nested inside it (frame offset, portrait size/position) scales off
  // this same value via container query units, so the whole composition
  // holds together at every viewport size. See .about-foreground below.
  --fg-width: 25vw;
}

// Relocated from being a direct flow-child of .about into
// .about-foreground, alongside the frame/portrait/content. margin-top is
// in vh (not cqw) because this gap reads as "distance from the hero
// stage," which is itself sized in vh — a viewport-height-relative unit
// fits that relationship better than one relative to .about-foreground's
// width would.
.about-heading {
  position: relative;
  z-index: 6;
  margin: 0 auto 1rem;
  width: fit-content;
}

.about-content {
  position: relative;
  z-index: 6;
  width: min(72vw, 760px);
  margin: 0 auto;
  padding-top: 2rem;
  margin-bottom: 100vw; // reserve space for the midground/foreground images
}

.about-text {
  max-width: 100%;

  p {
    margin: 0;
    font-size: clamp(1rem, 0.85rem + 0.6vw, 1.2rem);
    text-align: left;
    text-wrap: balance;
    padding-bottom: 20px;
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

.about-tree {
  position: absolute;

  /* center the larger frame around the foreground box */
  left: calc(-0.5 * var(--fg-width));
  bottom: 180cqw;
  width: calc(2.7 * var(--fg-width));
  z-index: 4;
  pointer-events: none;
  transform-origin: left top;
}

// MOTION-V DEPENDENCY: Both figures use bottom: 0 to anchor their base position.
// Visual parallax motion is applied entirely via Motion inline style transforms.
.about-midground {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100vw;
  z-index: 1;
  margin-top: 42vw;

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
  bottom: -1%;
  width: var(--fg-width);
  z-index: 3;

  // Makes this box a size container, so descendants can use cqw/cqh —
  // a percentage of THIS element's own (fluid) width/height — instead of
  // the viewport's. Since --fg-width already drives this element's width,
  // any cqw offset below scales at exactly the same rate as the images.
  container-type: inline-size;

  img:not(.about-tree) {
    width: 100%;
    height: auto;
    -webkit-user-drag: none;
  }
}

.about-portrait {
  order: 2;
  float: right;
  width: min(34vw, 260px);
  max-width: 260px;
  aspect-ratio: 1;
  margin: 0 0 1rem 1.5rem;
  border-radius: 50%;
  overflow: hidden;
  pointer-events: none;
  shape-outside: circle(50%);
  mask-image: radial-gradient(circle, #fff 23%, transparent 70%);
  mask-repeat: no-repeat;
  mask-size: 100% 100%;
  mask-position: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    -webkit-user-drag: none;
  }
}

.about-foreground .about-tree {
  /* Ensure the frame is allowed to be larger than its container */
  width: calc(2.7 * var(--fg-width));
  left: 0;

  // Was a fixed 300px offset that didn't scale with viewport width;

  // cqw ties it to the same fluid unit driving --fg-width.
  bottom: 180cqw;
  position: absolute;
  pointer-events: none;
  z-index: 4;
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

// The rule above hides every footer link (the Idea Garden one), so this
// has to override it — a class selector outranks `footer a`, so
// display: block wins here without touching the rule above.

// Icon is 2.5rem (40px) plus 0.25rem of padding on each side, making the
// whole tappable area 48px — comfortably over the ~44px minimum touch
// target that mobile guidelines recommend. The padding is part of the
// link, not the image, so taps just outside the icon still count.
.footer-linkedin {
  display: block;
  width: fit-content;
  margin: 0 auto 20px;
  padding: 0.25rem;
  border-radius: 10px;
  transition: transform 0.2s ease;

  img {
    display: block;
    width: 2.5rem;
    height: auto;
  }

  &:hover {
    transform: scale(1.08);
  }

  &:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
}

// ─── Responsive ───────────────────────────────────────────────

@media (width <= 37.5em) {
  .about-content {
    padding-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .about-text {
    order: 1;
    display: block;
  }

  .about-portrait {
    order: 2;
    float: none;
    display: block;
    width: min(56vw, 160px);
    margin: auto;
    shape-outside: none;
  }
}

@media (width > 37.5em) {
  .anchor p {
    font-size: 1.1rem;
    width: 80%;
  }
}

.about-heading,
.about-text p {
  text-shadow: 2px 3px 10px rgb(0 0 0 / 55%);
}
</style>
