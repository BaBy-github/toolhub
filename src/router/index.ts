import { createRouter, createWebHistory } from 'vue-router'
import { tools } from '@/data/tools'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('@/pages/Home.vue') },
    ...tools.map((tool) => ({
      path: tool.path,
      component: () => import(`@/pages/${tool.name}.vue`),
    })),
  ],
})

export default router
