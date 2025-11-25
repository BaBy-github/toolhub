<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { RiArrowLeftLine, RiClipboardLine, RiRefreshLine, RiArrowGoBackLine } from '@remixicon/vue'
import CodeEditor from 'monaco-editor-vue3'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import ActionButton from '@/components/ActionButton.vue'

const router = useRouter()
const dropRef = ref<HTMLElement | null>(null)
const splitRef = ref<HTMLElement | null>(null)
const showOutput = ref(false)
const output = ref('')
const copied = ref(false)
const error = ref('')
const leftRatio = ref(0.3)
const withPrefix = ref(false)
const lastDataUrl = ref('')
const fileInfo = ref<{ name: string; size: number; type: string } | null>(null)
const inputText = ref('')
const history = ref<string[]>([''])
const cursor = ref(0)
const applying = ref(false)
const canUndo = computed(() => cursor.value > 0 && !fileInfo.value)

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

function toBase64(file: File) {
  error.value = ''
  output.value = ''
  const r = new FileReader()
  r.onload = () => {
    const s = String(r.result || '')
    const comma = s.indexOf(',')
    const b64 = comma >= 0 ? s.slice(comma + 1) : s
    lastDataUrl.value = s
    output.value = withPrefix.value ? s : b64
    showOutput.value = true
  }
  r.onerror = () => {
    error.value = '读取文件失败'
  }
  r.readAsDataURL(file)
}

function handleFiles(files: FileList | null) {
  if (!files || files.length === 0) return
  const f = files.item(0)
  if (!f) return
  fileInfo.value = { name: f.name, size: f.size, type: f.type }
  toBase64(f)
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  handleFiles(e.dataTransfer?.files || null)
}
function onDragover(e: DragEvent) {
  e.preventDefault()
}
function onPaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return
  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    if (!it) continue
    if (it.kind === 'file') {
      const f = it.getAsFile()
      if (f) {
        fileInfo.value = { name: f.name || '剪贴板文件', size: f.size, type: f.type }
        toBase64(f)
        break
      }
    }
    if (it.kind === 'string' && it.type === 'text/plain') {
      it.getAsString((txt) => {
        inputText.value = txt || ''
      })
      break
    }
  }
}

function clearAll() {
  output.value = ''
  error.value = ''
  showOutput.value = false
  fileInfo.value = null
  inputText.value = ''
}

async function copyOutput() {
  if (!output.value) return
  try {
    await navigator.clipboard.writeText(output.value)
    copied.value = true
    window.setTimeout(() => { copied.value = false }, 1200)
  } catch {}
}

function goBack() {
  if (!output.value) router.push('/')
  else clearAll()
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

watch(withPrefix, () => {
  if (!lastDataUrl.value) return
  const s = lastDataUrl.value
  const comma = s.indexOf(',')
  const b64 = comma >= 0 ? s.slice(comma + 1) : s
  output.value = withPrefix.value ? s : b64
})

function encodeTextToBase64(s: string): string {
  const u8 = new TextEncoder().encode(s)
  let bin = ''
  for (const x of u8) bin += String.fromCharCode(x)
  return btoa(bin)
}

function pushHistory(v: string) {
  if (applying.value) return
  const cur = cursor.value
  if (cur < history.value.length - 1) history.value = history.value.slice(0, cur + 1)
  if (history.value[history.value.length - 1] !== v) {
    history.value.push(v)
    cursor.value = history.value.length - 1
  }
}
function undo() {
  if (cursor.value <= 0) return
  cursor.value = cursor.value - 1
  applying.value = true
  inputText.value = history.value[cursor.value] || ''
  applying.value = false
}

watch(inputText, (v) => {
  const trimmed = v.trim()
  pushHistory(v)
  if (!trimmed) {
    if (!fileInfo.value) { output.value = ''; showOutput.value = false }
    return
  }
  error.value = ''
  try {
    output.value = encodeTextToBase64(trimmed)
    showOutput.value = true
    fileInfo.value = null
  } catch {
    error.value = '文本转码失败'
  }
})

function formatBytes(n: number): string {
  if (!isFinite(n) || n < 0) return String(n) + ' B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let v = n
  while (v >= 1024 && i < units.length - 1) { v = v / 1024; i++ }
  const s = v >= 100 ? Math.round(v).toString() : v >= 10 ? v.toFixed(1) : v.toFixed(2)
  return s + ' ' + units[i]
}

const outOptions = { language: 'plaintext', theme: 'vs', readOnly: true, minimap: { enabled: false }, automaticLayout: true, wordWrap: 'on' }
const inOptions = { language: 'plaintext', theme: 'vs', minimap: { enabled: false }, automaticLayout: true, wordWrap: 'on' }
</script>

<template>
  <PageContainer>
    <PageHeader title="To Base64" @back="goBack" />

      <div v-if="!showOutput" ref="splitRef" class="grid grid-cols-1 gap-4">
        <div class="card">
          <div class="toolbar">
            <span>输入</span>
            <div class="flex items-center gap-2">
              <ActionButton variant="ghost" title="撤回" :disabled="!canUndo" @click="undo">
                <RiArrowGoBackLine size="18px" />
              </ActionButton>
              <button class="icon-btn" @click="clearAll"><RiRefreshLine size="16px" /></button>
            </div>
          </div>
          <div class="h-[60vh]">
            <div ref="dropRef" @drop="onDrop" @dragover="onDragover" class="h-full">
              <CodeEditor v-model:value="inputText" language="plaintext" theme="vs" :options="inOptions" height="100%" width="100%" />
            </div>
          </div>
        </div>
      </div>

      <div v-else ref="splitRef" class="flex gap-0">
        <div class="card" :style="{ width: leftWidth }">
          <div class="toolbar">
            <span>{{ fileInfo ? '文件信息' : '输入' }}</span>
            <div class="flex items-center gap-2">
              <ActionButton variant="ghost" title="撤回" :disabled="!canUndo" @click="undo">
                <RiArrowGoBackLine size="18px" />
              </ActionButton>
              <button class="icon-btn" @click="clearAll"><RiRefreshLine size="16px" /></button>
            </div>
          </div>
          <div v-if="fileInfo" class="p-4 text-sm text-gray-700">
            <div>
              <div>名称：{{ fileInfo.name }}</div>
              <div>大小：{{ formatBytes(fileInfo.size) }}</div>
              <div>类型：{{ fileInfo.type || '未知' }}</div>
            </div>
          </div>
          <div v-else class="h-[60vh]">
            <CodeEditor v-model:value="inputText" language="plaintext" theme="vs" :options="inOptions" height="100%" width="100%" />
          </div>
        </div>
        <div class="w-[6px] bg-gray-200 hover:bg-gray-300 cursor-col-resize" @mousedown="beginDrag" @touchstart="beginDrag"></div>
        <div class="relative card" :style="{ width: rightWidth }">
          <div class="toolbar">
            <span>Base64 输出</span>
            <div class="flex items-center gap-2">
              <label class="inline-flex items-center gap-1 text-xs text-gray-600">
                <input type="checkbox" v-model="withPrefix" @change="() => { if (fileInfo) showOutput = true }" />
                前缀
              </label>
              <ActionButton variant="ghost" title="复制" @click="copyOutput">
                <RiClipboardLine size="18px" />
              </ActionButton>
              <span class="text-xs" v-show="copied">已复制</span>
            </div>
          </div>
          <div class="h-[60vh]">
            <CodeEditor v-model:value="output" language="plaintext" theme="vs" :options="outOptions" height="100%" width="100%" />
          </div>
          <div v-if="error" class="border-t p-2 text-sm text-red-600">{{ error }}</div>
        </div>
      </div>
  </PageContainer>
</template>

<style scoped></style>
