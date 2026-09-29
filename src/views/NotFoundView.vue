<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="not-found">
    <h1>Page Not Found</h1>
    <p>This page doesn't exist, or it may have moved.</p>
    <RouterLink to="/" class="home-link">Back to home</RouterLink>
  </main>
</template>

<style scoped lang="scss">
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  text-align: center;

  // 100vh is the fallback for browsers without dvh; dvh keeps it truly
  // centered on phones, where 100vh includes the collapsing address bar.
  min-height: 100vh;
  min-height: 100dvh;
  padding: 20px;

  // Same star field as the home hero and the Oracle Library page. The
  // solid color matches .home-body and shows while the gif loads.
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
    text-wrap: balance;

    // Fluid size, floor to ceiling: about 28px on a small phone, 44px at
    // 768px, 68px at 1440px, capped at 72px. Slightly smaller than the
    // Coming Soon heading because "Page Not Found" is a longer phrase;
    // on the narrowest phones it can wrap onto two balanced lines.
    font-size: clamp(1.75rem, 1rem + 3.6vw, 4.5rem);

    // In em so the spacing scales with the text. The matching left padding
    // cancels the extra space letter-spacing adds after the last letter,
    // which would otherwise pull the text slightly left of center.
    letter-spacing: 0.12em;
    padding-left: 0.12em;
  }

  p {
    margin: 0;
    max-width: 32ch;
    font-family: var(--sans-serif-typeface);
    font-size: clamp(1rem, 0.85rem + 0.6vw, 1.35rem);
    line-height: 1.6;
    color: var(--light);
    text-shadow: 1px 2px 5px #3d3d3d;
    text-wrap: balance;
  }
}

// Same look as the beta notice and carousel buttons. min-height keeps the
// tap target at 44px+ on phones, and inline-flex centers the label in it.
.home-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  margin-top: 0.5rem;
  padding: 0.5rem 1.75rem;
  background: rgb(200 255 0 / 10%);
  border: 2px solid var(--primary);
  border-radius: 4px;
  color: var(--primary);
  font-family: var(--sans-serif-typeface);
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: rgb(200 255 0 / 20%);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 3px;
  }
}
</style>
