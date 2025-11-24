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
        <router-link to="/2json" class="group card p-4 transition hover:shadow-md">
          <div class="mb-3 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">{}</div>
            <div>
              <div class="text-base font-medium">To Json</div>
              <div class="text-xs text-gray-500">Json字符串、带转义的Json字符串</div>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">支持三种视图</div>
        </router-link>
        <router-link to="/2base64" class="group card p-4 transition hover:shadow-md">
          <div class="mb-3 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">B64</div>
            <div>
              <div class="text-base font-medium">To Base64</div>
              <div class="text-xs text-gray-500">文件、字符串</div>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-600">可解析文件mime</div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
