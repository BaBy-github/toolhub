<script setup lang="ts">
import BackButton from './BackButton.vue'
import { useRoute } from 'vue-router'
import { useTranslation } from 'i18next-vue'

const route = useRoute()
const { t } = useTranslation()
const p = defineProps<{
  title: string
  description?: string
}>()
const emit = defineEmits(['back'])

// 根据路由获取对应的描述文本
const getDescription = () => {
  if (p.description) {
    return p.description
  }

  // 根据路由路径匹配对应的描述
  const routeMap: Record<string, string> = {
    '/2diff': 'home.toDiff.description',
    '/2json': 'home.toJson.description',
    '/2base64': 'home.toBase64.description',
    '/2xml': 'home.toXml.description',
    '/2escape': 'home.toEscape.description',
  }

  const key = routeMap[route.path] || ''
  return key ? t(key) : ''
}
</script>

<template>
  <div class="mb-8">
    <!-- 主标题区域 -->
    <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div class="flex items-center gap-4 max-w-2xl">
        <!-- 返回按钮 -->
        <BackButton @click="emit('back')" />

        <!-- 标题和描述 -->
        <div>
          <h1
            class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl transition-colors duration-300"
          >
            {{ p.title }}
          </h1>
          <p
            v-if="getDescription()"
            class="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300"
          >
            {{ getDescription() }}
          </p>
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <div class="flex gap-2">
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- 装饰线 -->
    <div
      class="mt-6 h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-80 transition-opacity duration-300 hover:opacity-100"
    ></div>
  </div>
</template>

<style scoped></style>
