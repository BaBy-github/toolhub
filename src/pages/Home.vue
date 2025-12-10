<script setup lang="ts">
import { useTranslation } from 'i18next-vue'
import { tools } from '@/data/tools'

const { t } = useTranslation()

// 颜色值映射
const colorMap = {
  blue: {
    50: '#eff6ff',
    600: '#2563eb'
  },
  green: {
    50: '#ecfdf5',
    600: '#059669'
  },
  purple: {
    50: '#f5f3ff',
    600: '#7c3aed'
  },
  orange: {
    50: '#fff7ed',
    600: '#ea580c'
  },
  yellow: {
    50: '#fefce8',
    600: '#ca8a04'
  }
}

// 获取颜色值函数
const getColorValue = (color: string, shade: number) => {
  return colorMap[color as keyof typeof colorMap]?.[shade as keyof typeof colorMap.blue] || '#f3f4f6'
}
</script>

<template>
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 py-20 sm:py-32">
      <div class="mx-auto max-w-7xl px-6">
        <div class="flex flex-col items-center text-center">
          <div class="mb-8 flex items-center gap-2">
            <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              {{ t('home.title') }}
            </h1>
          </div>
          <p class="mx-auto max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300 sm:text-xl">
            {{ t('home.subtitle') }}
          </p>
        </div>
      </div>
      <!-- Decorative elements -->
      <div class="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div class="absolute -top-40 left-1/2 -translate-x-1/2 transform-gpu blur-3xl xl:-top-80" style="width: 100rem; height: 100rem; background: radial-gradient(circle, rgba(165, 180, 252, 0.2) 0%, rgba(255, 255, 255, 0) 70%);"></div>
        <div class="absolute -bottom-40 left-1/2 -translate-x-1/2 transform-gpu blur-3xl xl:-bottom-80" style="width: 100rem; height: 100rem; background: radial-gradient(circle, rgba(165, 180, 252, 0.2) 0%, rgba(255, 255, 255, 0) 70%);"></div>
      </div>
    </section>

    <!-- Tools Section -->
    <section id="tools" class="py-16 min-h-[calc(100vh-200px)]">
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <router-link 
          v-for="tool in tools" 
          :key="tool.id"
          :to="tool.path"
          class="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <div class="mb-4 flex items-center gap-3">
            <div 
              class="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
              :style="{
                backgroundColor: getColorValue(tool.color, 50),
                color: getColorValue(tool.color, 600)
              }"
            >
              <span class="text-xl font-bold">{{ tool.icon }}</span>
            </div>
            <div>
              <div class="text-xl font-semibold text-gray-900 dark:text-white">{{ t(tool.i18nKey) }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ t(tool.descriptionI18nKey) }}</div>
            </div>
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{{ t(tool.featureI18nKey) }}</div>
          <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent to-blue-500 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
        </router-link>
      </div>
    </section>
</template>

<style scoped></style>
