<script setup lang="ts">
// 通用骨架屏组件，用于工具页面加载时显示
</script>

<template>
  <div class="space-y-6">
    <!-- 页面头部骨架 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div class="space-y-2">
          <div class="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
      <div class="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    </div>

    <!-- 卡片容器 -->
    <div class="card">
      <!-- 工具栏骨架 -->
      <div
        class="toolbar flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-t-lg"
      >
        <div class="flex items-center gap-3">
          <div class="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div class="space-y-1">
            <div class="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div class="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>

      <!-- 编辑器区域骨架 -->
      <div class="h-[60vh] bg-gray-100 dark:bg-gray-800 rounded-b-lg animate-pulse">
        <div class="p-4 space-y-3">
          <!-- 编辑器顶部状态栏占位 -->
          <div class="h-5 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>

          <!-- 编辑器内容占位 -->
          <div class="space-y-2">
            <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div class="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div class="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div class="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 可选的底部操作区骨架 -->
    <div class="flex gap-3">
      <div class="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      <div class="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
    </div>
  </div>
</template>

<style scoped>
/* 骨架屏动画优化 */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
