<script setup lang="ts">
import { useTranslation } from 'i18next-vue'

const { t } = useTranslation()
</script>

<template>
  <router-view />
  <footer class="bg-gray-900 text-gray-300">
    <div class="mx-auto max-w-7xl px-6 py-12">
      <!-- Bottom Line -->
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-sm text-gray-500">
            © {{ new Date().getFullYear() }} ToolHub, Inc. 
          </p>
          <div class="mt-4 md:mt-0">
            <p class="text-sm text-gray-500">粤ICP备2020138557号-5</p>
          </div>
        </div>
    </div>
  </footer>
</template>

<style scoped>
/* 确保footer不会被其他元素遮挡 */
footer {
  z-index: 1000;
}
</style>
