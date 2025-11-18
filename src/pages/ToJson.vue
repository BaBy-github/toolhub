<script setup lang="ts">
import { ref, watch, computed, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { RiArrowLeftLine, RiClipboardLine } from '@remixicon/vue'
import CodeEditor from 'monaco-editor-vue3'
import { formatJson } from '@/utils/format'

const input = ref('')
const output = ref('')
const error = ref('')
const showOutput = ref(false)
const leftRatio = ref(0.2)
const splitRef = ref<HTMLElement | null>(null)
const copied = ref(false)
const router = useRouter()
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
  const clamp = (v: number, min = 0.2, max = 0.8) => Math.min(max, Math.max(min, v))
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
  if (!showOutput.value && trimmed.length > 0) {
    showOutput.value = true
    leftRatio.value = 0.2
  } else if (showOutput.value && trimmed.length === 0) {
    showOutput.value = false
  }
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
async function copyOutput() {
  if (!output.value) return
  try {
    await navigator.clipboard.writeText(output.value)
    copied.value = true
    window.setTimeout(() => { copied.value = false }, 1500)
  } catch {}
}
function goBack() {
  const trimmed = input.value.trim()
  if (trimmed.length === 0) router.push('/')
  else clearInput()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-7xl p-4">
      <div class="mb-4 flex items-center justify-between">
        <button class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" @click="goBack">
          <RiArrowLeftLine size="18px" />
        </button>
        <h1 class="text-xl font-semibold">JSON格式化</h1>
        <div class="flex gap-2"></div>
      </div>
      <div v-if="!showOutput" class="grid grid-cols-1 gap-4">
        <div class="rounded border bg-white shadow-sm overflow-hidden">
          <div class="border-b bg-gray-50 px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
            <span>输入</span>
            <button class="rounded-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 hover:bg-gray-50 text-xs" @click="clearInput">清空</button>
          </div>
          <div class="h-[60vh]">
            <CodeEditor v-model:value="input" language="json" theme="vs" :options="options" height="100%" width="100%" />
          </div>
        </div>
      </div>
      <div v-else ref="splitRef" class="flex gap-0">
        <div class="rounded border bg-white shadow-sm overflow-hidden" :style="{ width: leftWidth }">
          <div class="border-b bg-gray-50 px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
            <span>输入</span>
            <button class="rounded-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 hover:bg-gray-50 text-xs" @click="clearInput">清空</button>
          </div>
          <div class="h-[60vh]">
            <CodeEditor v-model:value="input" language="json" theme="vs" :options="options" height="100%" width="100%" />
          </div>
        </div>
        <div class="w-[6px] bg-gray-200 hover:bg-gray-300 cursor-col-resize" @mousedown="beginDrag" @touchstart="beginDrag"></div>
        <div class="relative rounded border bg-white shadow-sm overflow-hidden" :style="{ width: rightWidth }">
          <div class="border-b bg-gray-50 px-3 py-2 text-sm text-gray-600">格式化结果</div>
          <button class="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 hover:bg-gray-50" @click="copyOutput">
            <RiClipboardLine size="16px" />
            <span class="text-xs" v-show="copied">已复制</span>
          </button>
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