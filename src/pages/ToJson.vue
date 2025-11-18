<script setup lang="ts">
import { ref, watch, computed, nextTick, onBeforeUnmount } from 'vue'
import CodeEditor from 'monaco-editor-vue3'
import { formatJson } from '@/utils/format'

const input = ref('')
const output = ref('')
const error = ref('')
const showOutput = ref(false)
const leftRatio = ref(0.3)
const splitRef = ref<HTMLElement | null>(null)
let t: number | null = null

const options = { language: 'json', theme: 'vs', minimap: { enabled: false }, automaticLayout: true }
const outOptions = { language: 'json', theme: 'vs', readOnly: true, minimap: { enabled: false }, automaticLayout: true }

const leftWidth = computed(() => `${Math.round(leftRatio.value * 100)}%`)
const rightWidth = computed(() => `${100 - Math.round(leftRatio.value * 100)}%`)

let moveHandler: ((e: MouseEvent | TouchEvent) => void) | null = null
let upHandler: ((e: MouseEvent | TouchEvent) => void) | null = null

function beginDrag(e: MouseEvent | TouchEvent) {
  e.preventDefault()
  const box = splitRef.value?.getBoundingClientRect()
  if (!box) return
  const clamp = (v: number, min = 0.1, max = 0.95) => Math.min(max, Math.max(min, v))
  moveHandler = (ev: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in ev ? ev.touches[0].clientX : (ev as MouseEvent).clientX
    const x = clientX - box.left
    const ratio = clamp(x / box.width)
    leftRatio.value = ratio
  }
  upHandler = () => {
    window.removeEventListener('mousemove', moveHandler as any)
    window.removeEventListener('mouseup', upHandler as any)
    window.removeEventListener('touchmove', moveHandler as any)
    window.removeEventListener('touchend', upHandler as any)
  }
  window.addEventListener('mousemove', moveHandler as any)
  window.addEventListener('mouseup', upHandler as any)
  window.addEventListener('touchmove', moveHandler as any)
  window.addEventListener('touchend', upHandler as any)
}

onBeforeUnmount(() => {
  if (moveHandler) window.removeEventListener('mousemove', moveHandler as any)
  if (upHandler) window.removeEventListener('mouseup', upHandler as any)
  if (moveHandler) window.removeEventListener('touchmove', moveHandler as any)
  if (upHandler) window.removeEventListener('touchend', upHandler as any)
})

watch(leftRatio, async () => {
  await nextTick()
})

watch(input, (v) => {
  const trimmed = v.trim()
  showOutput.value = trimmed.length > 0
  if (t) clearTimeout(t as any)
  t = window.setTimeout(() => {
    if (!trimmed) { output.value = ''; error.value = '' ; return }
    const r = formatJson(v, { indent: 2, sortKeys: false })
    if (r.ok) { output.value = r.formatted as string; error.value = '' }
    else { output.value = ''; error.value = r.error as string }
  }, 200)
})

function clearInput() {
  input.value = ''
  showOutput.value = false
}
function copyOutput() { navigator.clipboard.writeText(output.value) }
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-7xl p-4">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold">JSON格式化</h1>
        <div class="flex gap-2">
          <button v-if="showOutput" class="rounded bg-blue-600 px-3 py-1.5 text-white" @click="copyOutput">复制结果</button>
          <button class="rounded bg-gray-200 px-3 py-1.5" @click="clearInput">清空输入</button>
        </div>
      </div>
      <div v-if="!showOutput" class="grid grid-cols-1 gap-4">
        <div class="rounded border bg-white shadow-sm overflow-hidden">
          <div class="border-b bg-gray-50 px-3 py-2 text-sm text-gray-600">输入</div>
          <div class="h-[60vh]">
            <CodeEditor v-model:value="input" language="json" theme="vs" :options="options" height="100%" width="100%" />
          </div>
        </div>
      </div>
      <div v-else ref="splitRef" class="flex gap-0">
        <div class="rounded border bg-white shadow-sm overflow-hidden" :style="{ width: leftWidth }">
          <div class="border-b bg-gray-50 px-3 py-2 text-sm text-gray-600">输入</div>
          <div class="h-[60vh]">
            <CodeEditor v-model:value="input" language="json" theme="vs" :options="options" height="100%" width="100%" />
          </div>
        </div>
        <div class="w-[6px] bg-gray-200 hover:bg-gray-300 cursor-col-resize" @mousedown="beginDrag" @touchstart="beginDrag"></div>
        <div class="rounded border bg-white shadow-sm overflow-hidden" :style="{ width: rightWidth }">
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