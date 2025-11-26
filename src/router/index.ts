import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('@/pages/Home.vue') },
    { path: '/2json', component: () => import('@/pages/ToJson.vue') },
    { path: '/2base64', component: () => import('@/pages/ToBase64.vue') },
    { path: '/2xml', component: () => import('@/pages/ToXml.vue') },
    { path: '/2diff', component: () => import('@/pages/ToDiff.vue') },
  ],
})

export default router
