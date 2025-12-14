<script setup lang="ts">
import { useTranslation } from 'i18next-vue'
import { i18n } from '@/i18n'
import { ref, onMounted } from 'vue'
import { RiTranslate2, RiMenu3Line, RiCloseLine, RiMoonLine, RiSunLine } from '@remixicon/vue'

const { t } = useTranslation()

// 移动端菜单状态
const mobileMenuOpen = ref(false)

// 黑白模式状态
const isDarkMode = ref(false)

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
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300"
  >
    <!-- Header -->
    <header
      class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo and Navigation -->
          <div class="flex items-center">
            <!-- Logo -->
            <a href="/" class="flex items-center gap-2">
              <div
                class="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold"
              >
                TH
              </div>
              <span class="text-xl font-bold text-gray-900 dark:text-white">ToolHub</span>
            </a>

            <!-- Desktop Navigation -->
            <nav class="hidden md:ml-10 md:flex md:items-center md:space-x-8">
              <a
                href="/"
                class="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
              >
                {{ t('nav.home') }}
              </a>
              <a
                href="/2json"
                class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
              >
                {{ t('home.toJson.title') }}
              </a>
              <a
                href="/2base64"
                class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
              >
                {{ t('home.toBase64.title') }}
              </a>
              <a
                href="/2xml"
                class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
              >
                {{ t('home.toXml.title') }}
              </a>
              <a
                href="/2diff"
                class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
              >
                {{ t('home.toDiff.title') }}
              </a>
              <a
                href="/2escape"
                class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
              >
                {{ t('home.toEscape.title') }}
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

        <!-- Mobile Navigation Menu -->
        <div
          v-if="mobileMenuOpen"
          class="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300"
        >
          <div class="space-y-1 px-4 py-3">
            <a
              href="/"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800"
            >
              {{ t('nav.home') }}
            </a>
            <a
              href="/2json"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
            >
              {{ t('home.toJson.title') }}
            </a>
            <a
              href="/2base64"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
            >
              {{ t('home.toBase64.title') }}
            </a>
            <a
              href="/2xml"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
            >
              {{ t('home.toXml.title') }}
            </a>
            <a
              href="/2diff"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
            >
              {{ t('home.toDiff.title') }}
            </a>
            <a
              href="/2escape"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
            >
              {{ t('home.toEscape.title') }}
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-64px-120px)]">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-300 dark:bg-gray-900 dark:text-gray-300">
      <div class="mx-auto max-w-7xl px-6 py-12">
        <!-- Bottom Line -->
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-sm text-gray-500">© {{ new Date().getFullYear() }} ToolHub, Inc.</p>
          <div class="mt-4 md:mt-0">
            <p class="text-sm text-gray-500">粤ICP备2020138557号-5</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 确保footer不会被其他元素遮挡 */
footer {
  z-index: 1000;
}
</style>
