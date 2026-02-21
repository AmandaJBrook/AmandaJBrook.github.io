<script setup lang="ts">
import MainNav from '../components/MainNav.vue'
</script>

<template>
  <header>
    <!-- Top Navigation -->
    <MainNav />
    <h1>Oracle Card Game</h1>
    <p>
      Drag a card from the deck and place it on the table. <br />
      Click once to flip the card over. <br />
    </p>
  </header>
  <main class="grid-main">
    <canvas class="game-canvas" width="800" height="600">
      <p>Content for the Oracle view will go here.</p>
    </canvas>
  </main>
  <footer>
    <p>This is a work in progress. Check back soon for updates!</p>
  </footer>
</template>

<style scoped>
.game-canvas {
  border: 1px solid #9f2525;
  background-color: #4f4132;
  display: block;
  margin: 2rem auto;
}
</style>
