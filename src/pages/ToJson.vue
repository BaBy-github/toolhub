<script setup lang="ts">
import { ref, watch, computed, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { RiClipboardLine, RiRefreshLine } from '@remixicon/vue'
import CodeEditor from 'monaco-editor-vue3'
import JsonColumns from '@/components/JsonColumns.vue'
import { JsonTreeView } from 'json-tree-view-vue3'
import { formatJson } from '@/utils/format'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'

const input = ref('')
const output = ref('')
const error = ref('')
const showOutput = ref(false)
const leftRatio = ref(0.2)
const splitRef = ref<HTMLElement | null>(null)
const copied = ref(false)
const viewMode = ref<'code' | 'tree' | 'columns'>('code')
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
    let clientX: number
    if ('touches' in ev) {
      const t0 = ev.touches[0]
      if (!t0) return
      clientX = t0.clientX
    } else {
      clientX = (ev as MouseEvent).clientX
    }
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
  <PageContainer>
    <PageHeader title="To Json" @back="goBack" />
      <div v-if="!showOutput" class="grid grid-cols-1 gap-4">
        <div class="card">
          <div class="toolbar">
            <span>输入</span>
            <button class="icon-btn" @click="clearInput"><RiRefreshLine size="16px" /></button>
          </div>
          <div class="h-[60vh]">
            <CodeEditor v-model:value="input" language="json" theme="vs" :options="options" height="100%" width="100%" />
          </div>
        </div>
      </div>
      <div v-else ref="splitRef" class="flex gap-0">
        <div class="card" :style="{ width: leftWidth }">
          <div class="toolbar">
            <span>输入</span>
            <button class="icon-btn" @click="clearInput"><RiRefreshLine size="16px" /></button>
          </div>
          <div class="h-[60vh]">
            <CodeEditor v-model:value="input" language="json" theme="vs" :options="options" height="100%" width="100%" />
          </div>
        </div>
        <div class="w-[6px] bg-gray-200 hover:bg-gray-300 cursor-col-resize" @mousedown="beginDrag" @touchstart="beginDrag"></div>
        <div class="relative card" :style="{ width: rightWidth }">
          <div class="toolbar">
            <span>格式化结果</span>
            <button class="btn btn-ghost" @click="copyOutput">
              <RiClipboardLine size="16px" />
              <span class="text-xs" v-show="copied">已复制</span>
            </button>
          </div>
          <div class="h-[60vh]">
            <CodeEditor v-if="viewMode==='code'" v-model:value="output" language="json" theme="vs" :options="outOptions" height="100%" width="100%" />
            <div v-else-if="viewMode==='tree'" class="h-full overflow-auto text-xs leading-tight json-tree-compact">
              <JsonTreeView :json="output || ''" :maxDepth="4" />
            </div>
            <JsonColumns v-else :value="output ? JSON.parse(output) : null" />
            <div class="absolute right-2 bottom-2">
              <div class="flex rounded-lg border overflow-hidden bg-white">
                <button :class="['px-2 py-1 text-xs', viewMode==='code' ? 'bg-blue-600 text-white' : 'btn-ghost']" @click="viewMode='code'">代码</button>
                <button :class="['px-2 py-1 text-xs', viewMode==='tree' ? 'bg-blue-600 text-white' : 'btn-ghost']" @click="viewMode='tree'">树</button>
                <button :class="['px-2 py-1 text-xs', viewMode==='columns' ? 'bg-blue-600 text-white' : 'btn-ghost']" @click="viewMode='columns'">列</button>
              </div>
            </div>
          </div>
          <div v-if="error" class="border-t p-2 text-sm text-red-600">{{ error }}</div>
        </div>
      </div>
  </PageContainer>
</template>

<style scoped></style>
