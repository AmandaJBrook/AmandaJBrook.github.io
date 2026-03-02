<script setup lang="ts">
import MainNav from '../components/MainNav.vue'
import OracleNav from '../components/OracleNav.vue'
import { useCurrentDeckStore } from '../stores/currentDeck'
const store = useCurrentDeckStore()
</script>

<template>
  <body class="oracle-body">
    <header>
      <!-- Top Navigation -->
      <MainNav
        :links="[
          { label: 'home', href: '/', type: 'router' },
          { label: 'oracle library', href: '/oracle-library', type: 'router' },
        ]"
      />
    </header>
    <main class="oracle-main">
      <section class="spread-area">
        <p>Playable area for cards will go here.</p>
      </section>
      <section class="deck-area"></section>
      <section class="card-selection" v-if="store.selectedCard">
        <h2>{{ store.selectedCard.title.toUpperCase() }}</h2>
        <h3>{{ store.selectedCard.subtitle.toUpperCase() }}</h3>
        <p>{{ store.selectedCard.description }}</p>
        <button @click="store.clearSelection">✕</button>
      </section>
    </main>
    <footer>
      <OracleNav
        @shuffle="store.shuffle"
        @clear-table="store.clearTable"
        @reset="store.reset"
        @toggle-reversal="store.reversalMode = !store.reversalMode"
        @deal-spread="(spread) => console.log('deal spread:', spread)"
      />
    </footer>
  </body>
</template>

<style scoped>
.oracle-body {
  display: grid;
  position: fixed;
  grid-template-columns: 1fr;
  grid-template-areas: 'top' 'main' 'bottom';
  background-color: var(--dark);
  background-repeat: cover;
}

header {
  grid-area: top;
  height: 60px;
}

.oracle-main {
  grid-area: main;
  border: 1px solid #28c02d;
  display: block;
  position: relative;
  height: 85vh;
  width: 100vw;
  margin: auto;
}

.spread-area {
  position: absolute;
  place-content: center center;
  border-radius: 5px;
  top: 5%;
  left: 3%;
  width: 94%;
  height: 90%;
  border: 1px solid #7e28c0;
}

.deck-area {
  background-image: url('/images/oracle-cards/back.png');
  position: absolute;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  place-content: center center;
  border-radius: 5px;
  bottom: 5%;
  left: 3%;
  width: 119px;
  height: 170px;
}

.card-selection {
  position: absolute;
  place-content: center center;
  border-radius: 5px;
  bottom: 5%;
  right: 3%;
  width: clamp(200px, 20vw, 300px);
  height: 30%;
  border: 1px solid #b1c028;
}

footer {
  grid-area: bottom;
  height: 60px;
}
</style>
