<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { RiClipboardLine, RiRefreshLine } from '@remixicon/vue'
import CodeEditor from 'monaco-editor-vue3'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import { formatXml, jsonToXml } from '@/utils/format'

const input = ref('')
const output = ref('')
const error = ref('')
const showOutput = ref(false)
const leftRatio = ref(0.2)
const splitRef = ref<HTMLElement | null>(null)
const dropRef = ref<HTMLElement | null>(null)
const copied = ref(false)
const router = useRouter()
let t: number | null = null

const options = { theme: 'vs', minimap: { enabled: false }, automaticLayout: true }
const outOptions = { language: 'xml', theme: 'vs', readOnly: true, minimap: { enabled: false }, automaticLayout: true }

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

watch(leftRatio, async () => { await nextTick() })

function clearInput() {
  input.value = ''
  showOutput.value = false
  error.value = ''
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

function onDrop(e: DragEvent) {
  e.preventDefault()
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return
  const f = files.item(0)
  if (!f) return
  const r = new FileReader()
  r.onload = () => { input.value = String(r.result || '') }
  r.onerror = () => { error.value = '读取文件失败' }
  r.readAsText(f)
}
function onDragover(e: DragEvent) { e.preventDefault() }

function onPaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return
  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    if (!it) continue
    if (it.kind === 'file') {
      const f = it.getAsFile()
      if (f) {
        const r = new FileReader()
        r.onload = () => { input.value = String(r.result || '') }
        r.onerror = () => { error.value = '读取文件失败' }
        r.readAsText(f)
        break
      }
    }
    if (it.kind === 'string' && it.type === 'text/plain') {
      it.getAsString((txt) => { input.value = txt || '' })
      break
    }
  }
}

onMounted(async () => {
  await nextTick()
  window.addEventListener('paste', onPaste as any)
})
onBeforeUnmount(() => {
  if (moveHandler) window.removeEventListener('mousemove', moveHandler as any)
  if (upHandler) window.removeEventListener('mouseup', upHandler as any)
  if (moveHandler) window.removeEventListener('touchmove', moveHandler as any)
  if (upHandler) window.removeEventListener('touchend', upHandler as any)
  window.removeEventListener('paste', onPaste as any)
})

watch(input, (v) => {
  const trimmed = v.trim()
  if (!showOutput.value && trimmed.length > 0) { showOutput.value = true; leftRatio.value = 0.2 }
  else if (showOutput.value && trimmed.length === 0) { showOutput.value = false }
  if (t) clearTimeout(t as any)
  t = window.setTimeout(() => {
    if (!trimmed) { output.value = ''; error.value = ''; return }
    let isXml = false
    try {
      const doc = new DOMParser().parseFromString(trimmed, 'application/xml')
      const err = doc.getElementsByTagName('parsererror')
      isXml = !err || err.length === 0
    } catch { isXml = false }
    const r = isXml ? formatXml(v, { indent: 2 }) : jsonToXml(v, { indent: 2 })
    if (r.ok) { output.value = r.formatted as string; error.value = '' }
    else { output.value = ''; error.value = r.error as string }
  }, 200)
})

const inputLang = computed(() => {
  const s = input.value.trim()
  try {
    const doc = new DOMParser().parseFromString(s, 'application/xml')
    const err = doc.getElementsByTagName('parsererror')
    return (!err || err.length === 0) ? 'xml' : 'json'
  } catch {
    return 'json'
  }
})
</script>

<template>
  <PageContainer>
    <PageHeader title="To Xml" @back="goBack" />
      <div v-if="!showOutput" class="grid grid-cols-1 gap-4">
        <div class="card">
          <div class="toolbar">
            <span>输入</span>
            <button class="icon-btn" @click="clearInput"><RiRefreshLine size="16px" /></button>
          </div>
          <div class="h-[60vh]">
            <div ref="dropRef" @drop="onDrop" @dragover="onDragover" class="h-full">
              <CodeEditor v-model:value="input" :language="inputLang" theme="vs" :options="options" height="100%" width="100%" />
            </div>
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
            <div ref="dropRef" @drop="onDrop" @dragover="onDragover" class="h-full">
              <CodeEditor v-model:value="input" :language="inputLang" theme="vs" :options="options" height="100%" width="100%" />
            </div>
          </div>
        </div>
        <div class="w-[6px] bg-gray-200 hover:bg-gray-300 cursor-col-resize" @mousedown="beginDrag" @touchstart="beginDrag"></div>
        <div class="relative card" :style="{ width: rightWidth }">
          <div class="toolbar">
            <span>XML 输出</span>
            <button class="btn btn-ghost" @click="copyOutput">
              <RiClipboardLine size="16px" />
              <span class="text-xs" v-show="copied">已复制</span>
            </button>
          </div>
          <div class="h-[60vh]">
            <CodeEditor v-model:value="output" language="xml" theme="vs" :options="outOptions" height="100%" width="100%" />
          </div>
          <div v-if="error" class="border-t p-2 text-sm text-red-600">{{ error }}</div>
        </div>
      </div>
  </PageContainer>
</template>

<style scoped></style>
