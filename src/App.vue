<!-- Acts as a wrapper for the entire app -->
<script setup>
import { RouterView } from 'vue-router'
// No menu logic here because your menu is now INSIDE HomeView.vue
</script>

<template>
  <!-- This is the ONLY thing in App.vue.
       It swaps between the entire Home UI and the entire Fluid UI -->
  <RouterView />
</template>
