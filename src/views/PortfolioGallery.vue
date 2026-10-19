<script setup lang="ts">
import { computed, ref } from 'vue'
import MainNav from '@/components/MainNav.vue'
import ImageCarousel from '@/components/ImageCarousel.vue'
import paintingArray from '@/data/paintings'
import designArray from '@/data/designs'
import webArray from '@/data/websites'

// id doubles as ImageCarousel 'category'
const tabs = [
  { id: 'painting', label: 'Painting and Illustration', items: paintingArray },
  { id: 'design', label: 'Graphic Design', items: designArray },
  { id: 'website', label: 'Web Design and Development', items: webArray },
] as const

type TabId = (typeof tabs)[number]['id']
const activeTab = ref<TabId>(tabs[0].id)
const activeIndex = computed(() => tabs.findIndex((tab) => tab.id === activeTab.value))
const activeItems = computed(() => tabs[activeIndex.value].items)
const tabRefs = ref<HTMLButtonElement[]>([])

function onKeydown(e: KeyboardEvent) {
  const last = tabs.length - 1
  const targets: Record<string, number> = {
    ArrowRight: (activeIndex.value + 1) % tabs.length,
    ArrowLeft: (activeIndex.value + last) % tabs.length,
    Home: 0,
    End: last,
  }

  const next = targets[e.key]
  if (next === undefined) return
  e.preventDefault()
  activeTab.value = tabs[next].id
  tabRefs.value[next]?.focus()
}
</script>

<template>
  <div class="portfolio-shell">
    <header class="global-navbar">
      <MainNav
        :links="[
          { label: 'home', href: '/', type: 'router' },
          { label: 'oracle', href: '/oracle', type: 'router' },
        ]"
      />
    </header>

    <main class="portfolio-page">
      <section class="portfolio">
        <h1 class="anchor" id="portfolio">PORTFOLIO</h1>

        <div
          class="tabs"
          role="tablist"
          aria-label="Portfolio galleries"
          :style="{ '--i': activeIndex, '--count': tabs.length }"
          @keydown="onKeydown"
        >
          <button
            v-for="(tab, i) in tabs"
            :key="tab.id"
            :ref="(el) => (tabRefs[i] = el as HTMLButtonElement)"
            :id="`tab-${tab.id}`"
            class="tab"
            role="tab"
            aria-controls="gallery-panel"
            :aria-selected="tab.id === activeTab"
            :tabindex="tab.id === activeTab ? 0 : -1"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div
          id="gallery-panel"
          class="gallery-container"
          role="tabpanel"
          :aria-labelledby="`tab-${activeTab}`"
        >
          <Transition name="gallery" mode="out-in">
            <div :key="activeTab">
              <ImageCarousel :items="activeItems" :category="activeTab" />
            </div>
          </Transition>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
.portfolio-page {
  margin: 5%;
}

.tabs {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--count), 1fr);
  margin-block: 1.5rem 2rem;
  border-bottom: 1px solid rgb(224 224 224 / 20%);

  // single sliding indicator
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: calc(100% / var(--count));
    height: 2px;
    background: var(--primary);
    transform: translateX(calc(var(--i) * 100%));
    transition: transform 0.35s cubic-bezier(0.65, 0, 0.35, 1);
  }
}

.tab {
  padding: 0.75rem 0.5rem;
  background: none;
  border: 0;
  cursor: pointer;
  font-family: var(--serif-typeface);
  font-size: clamp(1rem, 0.9rem + 0.5vw, 1.4rem);
  letter-spacing: 0.08rem;
  text-wrap: balance;
  color: var(--light);
  opacity: 0.6;
  transition:
    opacity 0.2s,
    color 0.2s;

  &[aria-selected='true'] {
    opacity: 1;
  }

  &:hover,
  &:focus-visible {
    color: var(--primary);
    opacity: 1;
  }
}

.gallery-enter-active,
.gallery-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.gallery-enter-from,
.gallery-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .tabs::after,
  .gallery-enter-active,
  .gallery-leave-active {
    transition: none;
  }
}
</style>
