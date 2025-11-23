import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('@/pages/Home.vue') },
    { path: '/tojson', component: () => import('@/pages/ToJson.vue') },
    { path: '/2base64', component: () => import('@/pages/FileToBase64.vue') },
  ],
})

export default router
