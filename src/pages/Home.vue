<script setup lang="ts">
import { useTranslation } from 'i18next-vue'
import { i18n } from '@/i18n'
import { RiTranslate2 } from '@remixicon/vue'

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
        <router-link to="/2json" class="group card p-4 transition hover:shadow-md">
          <div class="mb-3 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">{}</div>
            <div>
              <div class="text-base font-medium">{{ t('home.toJson.title') }}</div>
              <div class="text-xs text-gray-500">{{ t('home.toJson.description') }}</div>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">{{ t('home.toJson.feature') }}</div>
        </router-link>
        <router-link to="/2base64" class="group card p-4 transition hover:shadow-md">
          <div class="mb-3 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">B64</div>
            <div>
              <div class="text-base font-medium">{{ t('home.toBase64.title') }}</div>
              <div class="text-xs text-gray-500">{{ t('home.toBase64.description') }}</div>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">{{ t('home.toBase64.feature') }}</div>
        </router-link>
        <router-link to="/2xml" class="group card p-4 transition hover:shadow-md">
          <div class="mb-3 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">XML</div>
            <div>
              <div class="text-base font-medium">{{ t('home.toXml.title') }}</div>
              <div class="text-xs text-gray-500">{{ t('home.toXml.description') }}</div>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">{{ t('home.toXml.feature') }}</div>
        </router-link>
        <router-link to="/2diff" class="group card p-4 transition hover:shadow-md">
          <div class="mb-3 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">Δ</div>
            <div>
              <div class="text-base font-medium">{{ t('home.toDiff.title') }}</div>
              <div class="text-xs text-gray-500">{{ t('home.toDiff.description') }}</div>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">{{ t('home.toDiff.feature') }}</div>
        </router-link>
        <router-link to="/2escape" class="group card p-4 transition hover:shadow-md">
          <div class="mb-3 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">\</div>
            <div>
              <div class="text-base font-medium">{{ t('home.toEscape.title') }}</div>
              <div class="text-xs text-gray-500">{{ t('home.toEscape.description') }}</div>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">{{ t('home.toEscape.feature') }}</div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
