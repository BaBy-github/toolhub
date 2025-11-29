<script setup lang="ts">
import { useTranslation } from 'i18next-vue'
import { i18n } from '@/i18n'

const { t } = useTranslation()

// 切换语言
const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng)
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
        <div class="flex gap-2">
          <button 
            @click="changeLanguage('zh')" 
            class="px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            {{ t('language.zh') }}
          </button>
          <button 
            @click="changeLanguage('en')" 
            class="px-3 py-1 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            {{ t('language.en') }}
          </button>
        </div>
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
