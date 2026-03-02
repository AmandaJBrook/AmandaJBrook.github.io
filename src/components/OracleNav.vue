<script setup>
const emit = defineEmits(['shuffle', 'clear-table', 'deal-spread', 'reset', 'toggle-reversal'])
</script>

<template>
  <nav class="oracle-nav">
    <div class="shuffle-controls">
      <button @click="emit('shuffle', 'riffle')">Riffle</button>
      <button @click="emit('shuffle', 'overhand')">Overhand</button>
      <button @click="emit('shuffle', 'fisher-yates')">Random</button>
      <button @click="emit('shuffle', 'cut')">Cut</button>
      <button @click="emit('clear-table')">Clear Table</button>
      <button @click="emit('reset')">Reset</button>
      <label>
        <input type="checkbox" role="switch" @change="emit('toggle-reversal')" />
        Reversal Mode
      </label>
    </div>
    <div class="spread-controls">
      <button @click="emit('deal-spread', 'past-present-future')">Past · Present · Future</button>
      <button @click="emit('deal-spread', 'celtic-cross')">Celtic Cross</button>
      <button @click="emit('deal-spread', 'me-them-us')">Me · Them · Us</button>
    </div>
  </nav>
</template>
