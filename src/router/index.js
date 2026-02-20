import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/oracle',
      name: 'oracle',
      component: () => import('@/views/OracleView.vue'),
    },
  ],
})

export default router
