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
      path: '/portfolio',
      name: 'portfolio',
      component: () => import('@/views/PortfolioGallery.vue'),
    },
    {
      path: '/oracle',
      name: 'oracle',
      component: () => import('@/views/OracleView.vue'),
    },
    {
      path: '/oracle-library',
      name: 'oracle library',
      component: () => import('@/views/OracleLibrary.vue'),
    },
    // Must stay last: matches any path that none of the routes above did,
    // so unknown URLs show the Page Not Found view instead of a blank page.
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

export default router
