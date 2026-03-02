<script setup>
  defineProps({
    card: { type: Object, required: true },
  })
</script>

<template>
  <div class="oracle-card" :class="{ reversed: card.reversed }">
    <div class="card-inner">
      <div class="card-image-frame">
        <img :src="card.link" :alt="card.title" />
      </div>
      <div class="card-text-frame">
        <p class="card-title">{{ card.title.toUpperCase() }}</p>
        <p class="card-subtitle">{{ card.subtitle.toUpperCase() }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .oracle-card {
    width: 199px;
    height: 285px; /* 199 * (5/3.5) to maintain ratio */
    padding: 20px;
    box-sizing: border-box;
    transition: transform 0.6s ease;
  }

  .oracle-card.reversed {
    transform: rotate(180deg);
  }

  .card-inner {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .card-image-frame {
    width: 159px;
    height: 208px;
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .card-text-frame {
    width: 159px;
    height: 37px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .card-title {
    font-size: 1.4rem;
    margin: 0;
    line-height: 1;
  }

  .card-subtitle {
    font-size: 0.85rem;
    margin: 0;
    line-height: 1;
  }
</style>
