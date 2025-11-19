<script setup lang="ts"></script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-7xl p-6">
      <div class="mb-8 flex items-end justify-between">
        <div>
          <h1 class="text-2xl font-semibold">工具中心</h1>
          <p class="mt-2 text-sm text-gray-600">选择一个工具开始使用</p>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <router-link to="/tojson" class="group card p-4 transition hover:shadow-md">
          <div class="mb-3 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">{}</div>
            <div>
              <div class="text-base font-medium">JSON 格式化</div>
              <div class="text-xs text-gray-500">将字符串解析并格式化为 JSON</div>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">粘贴字符串，右侧实时展示格式化结果</div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped></style>