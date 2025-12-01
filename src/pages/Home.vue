<script setup lang="ts">
import { useTranslation } from 'i18next-vue'
import { i18n } from '@/i18n'
import { RiTranslate2 } from '@remixicon/vue'
import { tools } from '@/data/tools'

const { t } = useTranslation()

// 切换语言
const toggleLanguage = () => {
  const currentLng = i18n.language
  const newLng = currentLng === 'zh' ? 'en' : 'zh'
  i18n.changeLanguage(newLng)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-7xl p-6">
      <div class="mb-8 flex items-end justify-between">
        <div>
          <h1 class="text-2xl font-semibold">{{ t('home.title') }}</h1>
          <p class="mt-2 text-sm text-gray-600">{{ t('home.subtitle') }}</p>
        </div>
        <button 
          @click="toggleLanguage" 
          class="flex items-center gap-2 px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
          title="切换语言"
        >
          <RiTranslate2 size="18px" class="transition-transform duration-300 hover:rotate-180" />
          <span>{{ i18n.language === 'zh' ? t('language.en') : t('language.zh') }}</span>
        </button>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <router-link 
          v-for="tool in tools" 
          :key="tool.id"
          :to="tool.path"
          class="group card p-4 transition hover:shadow-md"
        >
          <div class="mb-3 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl" :class="`bg-${tool.color}-50 text-${tool.color}-600`">
              {{ tool.icon }}
            </div>
            <div>
              <div class="text-base font-medium">{{ t(tool.i18nKey) }}</div>
              <div class="text-xs text-gray-500">{{ t(tool.descriptionI18nKey) }}</div>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">{{ t(tool.featureI18nKey) }}</div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
