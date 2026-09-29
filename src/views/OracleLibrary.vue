<template>
  <main class="coming-soon">
    <h1>Coming Soon</h1>
  </main>
</template>

<style scoped lang="scss">
.coming-soon {
  // Centers the heading both ways. 100vh is the fallback for browsers
  // without dvh; dvh then keeps it truly centered on phones, where 100vh
  // includes the space behind the collapsing address bar.
  display: grid;
  place-items: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 20px;

  // Same star field as the home page hero (.hero-visual-stage). The solid
  // color matches .home-body and shows while the gif loads.
  background-color: color(srgb 7% 7% 7%);
  background-image: url('/images/home/parallax/stars.gif');
  background-position: center;
  background-size: auto;
  background-repeat: repeat;

  h1 {
    margin: 0;
    font-family: var(--serif-typeface);
    color: var(--primary);
    text-shadow: 1px 2px 5px #3d3d3d;
    text-align: center;
    text-wrap: balance;

    // Fluid size: a fixed base plus a vw-based slope, held between a floor
    // and a ceiling. Roughly 32px at 320px wide, 50px at 768px, and 77px
    // at 1440px, then it stops growing at 88px on very large screens, so
    // it never outgrows a phone or looks lost on a wide monitor.
    font-size: clamp(2rem, 1.2rem + 4vw, 5.5rem);

    // In em so the spacing scales with the text. Letter-spacing also adds
    // space after the last letter, which pulls the visible text slightly
    // left of center; the matching left padding cancels that out.
    letter-spacing: 0.12em;
    padding-left: 0.12em;
  }
}
</style>
