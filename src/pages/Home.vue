<script setup lang="ts">
import { useTranslation } from 'i18next-vue'
import { i18n } from '@/i18n'
import { ref, onMounted, watch } from 'vue'
import { RiTranslate2, RiMenu3Line, RiCloseLine, RiMoonLine, RiSunLine } from '@remixicon/vue'
import { tools } from '@/data/tools'

const { t } = useTranslation()

// 移动端菜单状态
const mobileMenuOpen = ref(false)

// 黑白模式状态
const isDarkMode = ref(false)

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

// 切换语言
const toggleLanguage = () => {
  const currentLng = i18n.language
  const newLng = currentLng === 'zh' ? 'en' : 'zh'
  i18n.changeLanguage(newLng)
}

// 切换黑白模式
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('darkMode', isDarkMode.value.toString())
}

// 初始化黑白模式
onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode) {
    isDarkMode.value = savedDarkMode === 'true'
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

// 监听系统主题变化
watch(isDarkMode, (newValue) => {
  if (newValue) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo and Navigation -->
          <div class="flex items-center">
            <!-- Logo -->
            <a href="/" class="flex items-center gap-2">
              <div class="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                TH
              </div>
              <span class="text-xl font-bold text-gray-900 dark:text-white">ToolHub</span>
            </a>

            <!-- Desktop Navigation -->
            <nav class="hidden md:ml-10 md:flex md:items-center md:space-x-8">
              <a href="/" class="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
                {{ t('nav.home') }}
              </a>
              <a href="#tools" class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
                {{ t('nav.tools') }}
              </a>
              <a href="#about" class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
                {{ t('nav.about') }}
              </a>
              <a href="#" class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
                {{ t('nav.contact') }}
              </a>
            </nav>
          </div>

          <!-- Right Side Actions -->
          <div class="flex items-center gap-3">
            <!-- Language Toggle -->
            <button
              @click="toggleLanguage"
              class="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
              title="{{ t('nav.toggleLanguage') }}"
            >
              <RiTranslate2 size="16px" />
              <span class="hidden sm:inline">{{ i18n.language === 'zh' ? 'EN' : '中文' }}</span>
            </button>

            <!-- Dark Mode Toggle -->
            <button
              @click="toggleDarkMode"
              class="inline-flex items-center justify-center p-2 rounded-md text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
              title="{{ t('nav.toggleDarkMode') }}"
            >
              <template v-if="isDarkMode">
                <RiSunLine size="16px" />
              </template>
              <template v-else>
                <RiMoonLine size="16px" />
              </template>
            </button>

            <!-- Mobile Menu Button -->
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
              aria-expanded="false"
            >
              <span class="sr-only">{{ t('nav.openMenu') }}</span>
              <template v-if="mobileMenuOpen">
                <RiCloseLine size="24px" />
              </template>
              <template v-else>
                <RiMenu3Line size="24px" />
              </template>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div class="space-y-1 px-4 py-3">
          <a
            href="/"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800"
          >
            {{ t('nav.home') }}
          </a>
          <a
            href="#tools"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
          >
            {{ t('nav.tools') }}
          </a>
          <a
            href="#about"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
          >
            {{ t('nav.about') }}
          </a>
          <a
            href="#"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
          >
            {{ t('nav.contact') }}
          </a>
        </div>
      </div>
    </header>
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
          <div class="mt-10 flex items-center justify-center gap-4">
            <a 
              href="#tools" 
              class="rounded-lg bg-blue-600 dark:bg-blue-700 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-300"
            >
              {{ t('home.getStarted') }}
            </a>
            <a 
              href="#about" 
              class="rounded-lg bg-white dark:bg-gray-800 px-6 py-3 text-base font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
            >
              {{ t('home.learnMore') }}
            </a>
          </div>
        </div>
      </div>
      <!-- Decorative elements -->
      <div class="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div class="absolute -top-40 left-1/2 -translate-x-1/2 transform-gpu blur-3xl xl:-top-80" style="width: 100rem; height: 100rem; background: radial-gradient(circle, rgba(165, 180, 252, 0.2) 0%, rgba(255, 255, 255, 0) 70%);"></div>
        <div class="absolute -bottom-40 left-1/2 -translate-x-1/2 transform-gpu blur-3xl xl:-bottom-80" style="width: 100rem; height: 100rem; background: radial-gradient(circle, rgba(165, 180, 252, 0.2) 0%, rgba(255, 255, 255, 0) 70%);"></div>
      </div>
    </section>

    <!-- Tools Section -->
    <section id="tools" class="py-16">
      <div class="mx-auto max-w-7xl px-6">
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
      </div>
    </section>

  </div>
</template>

<style scoped></style>
