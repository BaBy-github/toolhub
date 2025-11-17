<script setup lang="ts">
import { ref, watch } from 'vue'
import CodeEditor from 'monaco-editor-vue3'
import { formatJson } from '@/utils/format'
const input = ref('')
const output = ref('')
const error = ref('')
const options = { language: 'json', theme: 'vs', minimap: { enabled: false }, automaticLayout: true }
const outOptions = { language: 'json', theme: 'vs', readOnly: true, minimap: { enabled: false }, automaticLayout: true }
let t: number | null = null
watch(input, (v) => {
  if (t) clearTimeout(t as any)
  t = window.setTimeout(() => {
    const r = formatJson(v, { indent: 2, sortKeys: false })
    if (r.ok) { output.value = r.formatted as string; error.value = '' }
    else { output.value = ''; error.value = r.error as string }
  }, 200)
})
function clearInput() { input.value = '' }
function copyOutput() { navigator.clipboard.writeText(output.value) }
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-7xl p-4">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold">JSON格式化</h1>
        <div class="flex gap-2">
          <button class="rounded bg-blue-600 px-3 py-1.5 text-white" @click="copyOutput">复制结果</button>
          <button class="rounded bg-gray-200 px-3 py-1.5" @click="clearInput">清空输入</button>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div class="rounded border bg-white shadow-sm overflow-hidden">
          <div class="border-b bg-gray-50 px-3 py-2 text-sm text-gray-600">输入</div>
          <div class="h-[60vh]">
            <CodeEditor v-model:value="input" language="json" theme="vs" :options="options" height="100%" width="100%" />
          </div>
        </div>
        <div class="rounded border bg-white shadow-sm overflow-hidden">
          <div class="border-b bg-gray-50 px-3 py-2 text-sm text-gray-600">格式化结果</div>
          <div class="h-[60vh]">
            <CodeEditor v-model:value="output" language="json" theme="vs" :options="outOptions" height="100%" width="100%" />
          </div>
          <div v-if="error" class="border-t p-2 text-sm text-red-600">{{ error }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>