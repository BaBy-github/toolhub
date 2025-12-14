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
import SkeletonLoader from '@/components/SkeletonLoader.vue'

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
const isLoading = ref(true)
const canUndo = computed(() => cursor.value > 0 || fileInfo.value)

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
  history.value = ['']
  cursor.value = 0
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
        history.value = ['']
        cursor.value = 0
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
    window.setTimeout(() => {
      copied.value = false
    }, 1000)
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

  // 内容加载完成，隐藏骨架屏
  isLoading.value = false
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
  history.value.push(v)
  cursor.value = history.value.length - 1
}
function undo() {
  applying.value = true
  // 清空所有状态
  fileInfo.value = null
  inputText.value = ''
  output.value = ''
  showOutput.value = false
  error.value = ''
  // 重置历史记录和光标
  history.value = ['']
  cursor.value = 0
  applying.value = false
}

watch(inputText, (v) => {
  const trimmed = v.trim()
  pushHistory(v)
  if (!trimmed) {
    if (!fileInfo.value) {
      output.value = ''
      showOutput.value = false
    }
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
  while (v >= 1024 && i < units.length - 1) {
    v = v / 1024
    i++
  }
  const s = v >= 100 ? Math.round(v).toString() : v >= 10 ? v.toFixed(1) : v.toFixed(2)
  return s + ' ' + units[i]
}

const outOptions = {
  language: 'plaintext',
  theme: 'vs',
  readOnly: true,
  minimap: { enabled: false },
  automaticLayout: true,
  wordWrap: 'on',
}
const inOptions = {
  language: 'plaintext',
  theme: 'vs',
  minimap: { enabled: false },
  automaticLayout: true,
  wordWrap: 'on',
}
</script>

<template>
  <PageContainer>
    <template v-if="isLoading">
      <SkeletonLoader />
    </template>
    <template v-else>
      <PageHeader :title="t('base64.title')" @back="goBack" />

      <div ref="splitRef" class="flex gap-2">
        <!-- 输入区域 -->
        <div class="card" :style="{ width: showOutput ? leftWidth : '100%' }">
          <div class="toolbar">
            <div class="flex items-center gap-2">
              <span>{{ fileInfo ? t('base64.fileInfo') : t('common.input') }}</span>
              <ActionButton
                variant="primary"
                size="sm"
                title="上传文件"
                @click="fileInput?.click()"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </ActionButton>
            </div>
            <div class="flex items-center gap-2">
              <ActionButton
                variant="ghost"
                icon-only
                size="sm"
                title="撤回"
                :disabled="!canUndo"
                @click="undo"
              >
                <RiArrowGoBackLine size="16px" />
              </ActionButton>
            </div>
          </div>
          <div v-if="fileInfo" class="p-4 text-sm text-gray-700 rounded-b-2xl">
            <div>
              <div>名称：{{ fileInfo.name }}</div>
              <div>大小：{{ formatBytes(fileInfo.size) }}</div>
              <div>类型：{{ fileInfo.type || '未知' }}</div>
            </div>
          </div>
          <div v-else class="relative">
            <div class="h-[60vh]">
              <div ref="dropRef" @drop="onDrop" @dragover="onDragover" class="h-full relative">
                <CodeEditor
                  v-model:value="inputText"
                  language="plaintext"
                  theme="vs"
                  :options="inOptions"
                  height="100%"
                  width="100%"
                />
                <!-- 隐藏的文件输入 -->
                <input
                  ref="fileInput"
                  type="file"
                  class="hidden"
                  @change="(e) => handleFiles((e.target as HTMLInputElement).files)"
                />
              </div>
            </div>
          </div>
          <div class="p-2 text-sm">&#8203;</div>
        </div>

        <!-- 分割线 -->
        <div
          v-show="showOutput"
          class="w-[6px] bg-gray-200 hover:bg-gray-300 cursor-col-resize"
          @mousedown="beginDrag"
          @touchstart="beginDrag"
        ></div>

        <!-- 输出区域 -->
        <div v-show="showOutput" class="relative card" :style="{ width: rightWidth }">
          <div class="toolbar">
            <span>{{ t('base64.output') }}</span>
            <div class="flex items-center gap-2">
              <label class="inline-flex items-center gap-1 text-xs text-gray-600">
                <input
                  type="checkbox"
                  v-model="withPrefix"
                  @change="
                    () => {
                      if (fileInfo) showOutput = true
                    }
                  "
                />
                {{ t('base64.prefix') }}
              </label>
              <div class="relative">
                <!-- 复制按钮 -->
                <ActionButton
                  v-if="!copied"
                  variant="ghost"
                  icon-only
                  size="sm"
                  title="复制"
                  @click="copyOutput"
                  class="transition-all duration-300"
                >
                  <RiClipboardLine size="16px" />
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
          <div class="relative">
            <div class="h-[60vh]">
              <CodeEditor
                v-model:value="output"
                language="plaintext"
                theme="vs"
                :options="outOptions"
                height="100%"
                width="100%"
              />
            </div>
          </div>
          <div v-if="error" class="border-t p-2 text-sm text-red-600">{{ error }}</div>
        </div>
      </div>
    </template>
  </PageContainer>
</template>

<style scoped></style>
