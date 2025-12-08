<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslation } from 'i18next-vue'
import { RiArrowLeftLine, RiClipboardLine, RiRefreshLine, RiArrowGoBackLine } from '@remixicon/vue'

const { t } = useTranslation()
import CodeEditor from 'monaco-editor-vue3'
import { popToolState } from '@/utils/toolState'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import ActionButton from '@/components/ActionButton.vue'

const router = useRouter()
const dropRef = ref<HTMLElement | null>(null)
const splitRef = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const showOutput = ref(false)
const output = ref('')
const copied = ref(false)
const error = ref('')
const leftRatio = ref(0.2)
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
    error.value = t('base64.fileReadError')
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
    window.setTimeout(() => { copied.value = false }, 1000)
  } catch {}
}

function goBack() {
  const prevState = popToolState()
  if (prevState) {
    router.push(prevState.path)
  } else {
    router.push('/')
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
    leftRatio.value = 0.2
    fileInfo.value = null
  } catch {
    error.value = t('base64.textEncodeError')
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
    <PageHeader :title="t('base64.title')" @back="goBack" />

    <div ref="splitRef" class="flex gap-0">
      <!-- 输入区域 -->
      <div class="card" :style="{ width: showOutput ? leftWidth : '100%' }">
        <div class="toolbar">
          <span>{{ fileInfo ? t('base64.fileInfo') : t('common.input') }}</span>
          <div class="flex items-center gap-2">
            <ActionButton variant="ghost" title="撤回" :disabled="!canUndo" @click="undo">
              <RiArrowGoBackLine size="18px" />
            </ActionButton>
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
          <div ref="dropRef" @drop="onDrop" @dragover="onDragover" class="h-full relative">
            <CodeEditor v-model:value="inputText" language="plaintext" theme="vs" :options="inOptions" height="100%" width="100%" />
            <!-- 隐藏的文件输入 -->
            <input ref="fileInput" type="file" class="hidden" @change="(e) => handleFiles((e.target as HTMLInputElement).files)" />
            <!-- 悬浮上传层 -->
            <div v-if="!inputText.trim()" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-300">
              <div class="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center pointer-events-auto transform transition-all duration-300 hover:shadow-xl">
                <button 
                  @click="fileInput?.click()" 
                  class="flex flex-col items-center justify-center gap-2 mb-4 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span class="text-lg font-medium">上传文件</span>
                </button>
                <p class="text-gray-600 text-sm">编辑或拖入文件到此处</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分割线 -->
      <div v-show="showOutput" class="w-[6px] bg-gray-200 hover:bg-gray-300 cursor-col-resize" @mousedown="beginDrag" @touchstart="beginDrag"></div>

      <!-- 输出区域 -->
      <div v-show="showOutput" class="relative card" :style="{ width: rightWidth }">
        <div class="toolbar">
            <span>{{ t('base64.output') }}</span>
            <div class="flex items-center gap-2">
              <label class="inline-flex items-center gap-1 text-xs text-gray-600">
                <input type="checkbox" v-model="withPrefix" @change="() => { if (fileInfo) showOutput = true }" />
                {{ t('base64.prefix') }}
              </label>
              <div class="relative">
                <!-- 复制按钮 -->
                <ActionButton 
                  v-if="!copied" 
                  variant="ghost" 
                  title="复制" 
                  @click="copyOutput"
                  class="transition-all duration-300"
                >
                  <RiClipboardLine size="18px" />
                </ActionButton>
                <!-- 已复制文字 -->
              <span 
                v-else 
                class="inline-flex items-center justify-center h-9 w-16 bg-green-100 text-green-800 text-xs font-medium rounded-2xl transition-all duration-300"
              >
                {{ t('common.copied') }}
              </span>
              </div>
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
