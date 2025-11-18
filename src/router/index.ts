import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('@/pages/Home.vue') },
    { path: '/tojson', component: () => import('@/pages/ToJson.vue') },
  ],
})

export default router
