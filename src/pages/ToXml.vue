<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTranslation } from 'i18next-vue'
import { RiClipboardLine, RiRefreshLine, RiArrowGoBackLine } from '@remixicon/vue'

const { t } = useTranslation()
import CodeEditor from 'monaco-editor-vue3'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import { formatXml, jsonToXml } from '@/utils/format'
import { pushToolState, popToolState, getNextToolInput, setNextToolInput } from '@/utils/toolState'
import ActionButton from '@/components/ActionButton.vue'
import ConversionButton from '@/components/ConversionButton.vue'

const input = ref('')
const output = ref('')
const error = ref('')
const showOutput = ref(false)
const leftRatio = ref(0.2)
const splitRef = ref<HTMLElement | null>(null)
const dropRef = ref<HTMLElement | null>(null)
const copied = ref(false)
const router = useRouter()
const route = useRoute()
const isLoading = ref(true)
let timeoutId: number | null = null
const history = ref<string[]>([''])
const cursor = ref(0)
const applying = ref(false)
const canUndo = computed(() => cursor.value > 0)

// 从toolState获取初始值，优先于URL query参数
const nextInput = getNextToolInput()
if (nextInput) {
  input.value = nextInput
  // 处理初始输入，计算输出
  handleInputChange(input.value)
} else if (route.query.input) {
  input.value = route.query.input as string
  // 处理初始输入，计算输出
  handleInputChange(input.value)
} else if (input.value.trim()) {
  // 否则处理初始输入，计算输出
  handleInputChange(input.value)
}

const options = { theme: 'vs', minimap: { enabled: false }, automaticLayout: true }
const outOptions = {
  language: 'xml',
  theme: 'vs',
  readOnly: true,
  minimap: { enabled: false },
  automaticLayout: true,
}

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

watch(leftRatio, async () => {
  await nextTick()
})

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
    window.setTimeout(() => {
      copied.value = false
    }, 1000)
  } catch {}
}

function goBack() {
  const prevState = popToolState()
  if (prevState) {
    // 使用setNextToolInput传递状态，不使用URL参数
    setNextToolInput(prevState.input)
    // 跳转到之前的路径，不携带URL参数
    router.push(prevState.path)
  } else {
    router.push('/')
  }
}

function goToJson() {
  // 保存当前状态
  pushToolState({
    path: '/2xml',
    input: input.value,
    output: output.value,
    showOutput: showOutput.value,
    leftRatio: leftRatio.value,
  })

  // 使用toolState传递值，而不是URL query参数
  setNextToolInput(output.value)

  // 跳转到ToJson页面
  router.push({
    path: '/2json',
  })
}

function goToDiff() {
  // 保存当前状态
  pushToolState({
    path: '/2xml',
    input: input.value,
    output: output.value,
    showOutput: showOutput.value,
    leftRatio: leftRatio.value,
  })

  // 使用toolState传递值，而不是URL query参数
  setNextToolInput(output.value)

  // 跳转到ToDiff页面
  router.push({
    path: '/2diff',
  })
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return
  const f = files.item(0)
  if (!f) return
  const r = new FileReader()
  r.onload = () => {
    input.value = String(r.result || '')
  }
  r.onerror = () => {
    error.value = t('xml.fileReadError')
  }
  r.readAsText(f)
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
        const r = new FileReader()
        r.onload = () => {
          input.value = String(r.result || '')
        }
        r.onerror = () => {
          error.value = t('xml.fileReadError')
        }
        r.readAsText(f)
        break
      }
    }
    if (it.kind === 'string' && it.type === 'text/plain') {
      it.getAsString((txt) => {
        input.value = txt || ''
      })
      break
    }
  }
}

onMounted(async () => {
  await nextTick()
  window.addEventListener('paste', onPaste as any)
  // 如果有初始输入值，自动显示输出框并计算输出
  if (input.value.trim()) {
    showOutput.value = true
    handleInputChange(input.value)
  }

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

// 处理输入变化，计算输出
function handleInputChange(v: string) {
  const trimmed = v.trim()
  pushHistory(v)
  if (!showOutput.value && trimmed.length > 0) {
    showOutput.value = true
    leftRatio.value = 0.2
  } else if (showOutput.value && trimmed.length === 0) {
    showOutput.value = false
  }
  if (timeoutId) clearTimeout(timeoutId as any)
  timeoutId = window.setTimeout(() => {
    if (!trimmed) {
      output.value = ''
      error.value = ''
      return
    }

    // 检查是否为有效的XML
    let isXml = false
    try {
      const doc = new DOMParser().parseFromString(trimmed, 'application/xml')
      const err = doc.getElementsByTagName('parsererror')
      isXml = err.length === 0
    } catch {
      isXml = false
    }

    if (isXml) {
      // 如果是有效的XML，使用formatXml格式化
      const r = formatXml(v, { indent: 2 })
      if (r.ok) {
        output.value = r.formatted as string
        error.value = ''
      } else {
        output.value = ''
        error.value = r.error as string
      }
    } else {
      // 如果不是有效的XML，尝试使用jsonToXml转换
      const r = jsonToXml(v, { indent: 2 })
      if (r.ok) {
        output.value = r.formatted as string
        error.value = ''
      } else {
        // 如果jsonToXml也失败，显示更合适的错误信息
        output.value = ''
        // 检查输入是否看起来像XML但格式错误
        const looksLikeXml = /^\s*<([A-Za-z_][\w\-\.:]*)[\s\S]*>\s*$/.test(trimmed)
        error.value = looksLikeXml ? t('xml.parseXmlError') : t('xml.parseJsonOrXmlError')
      }
    }
  }, 200)
}

watch(input, (v) => {
  handleInputChange(v)
})

const inputLang = computed(() => {
  const s = input.value.trim()
  try {
    const doc = new DOMParser().parseFromString(s, 'application/xml')
    const err = doc.getElementsByTagName('parsererror')
    return !err || err.length === 0 ? 'xml' : 'json'
  } catch {
    return 'json'
  }
})

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
  input.value = history.value[cursor.value] || ''
  applying.value = false
}
</script>

<template>
  <PageContainer>
    <template v-if="isLoading">
      <SkeletonLoader />
    </template>
    <template v-else>
      <PageHeader :title="t('xml.title')" @back="goBack">
        <template #actions>
          <ConversionButton
            current-tool="xml"
            :conversions="[
              {
                name: 'json',
                label: 'To Json',
                path: '/2json',
                icon: '{}',
                color: '#3b82f6',
              },
              {
                name: 'diff',
                label: 'To Diff',
                path: '/2diff',
                icon: '≠',
                color: '#f97316',
              },
              {
                name: 'escape',
                label: 'To Escape',
                path: '/2escape',
                icon: '\\',
                color: '#10b981',
              },
            ]"
            @conversion="
              (conversion) => {
                // 保存当前状态
                pushToolState({
                  path: '/2xml',
                  input: input,
                  output: output,
                  showOutput: showOutput,
                  leftRatio: leftRatio,
                })
                // 使用toolState传递值，而不是URL query参数
                setNextToolInput(output)
                // 跳转到目标工具页面
                router.push({
                  path: conversion.path,
                })
              }
            "
          />
        </template>
      </PageHeader>
      <div ref="splitRef" class="flex gap-0">
        <!-- 输入区域 -->
        <div class="card" :style="{ width: showOutput ? leftWidth : '100%' }">
          <div class="toolbar">
            <span>{{ t('common.input') }}</span>
            <div class="flex items-center gap-2">
              <ActionButton variant="ghost" title="撤回" :disabled="!canUndo" @click="undo">
                <RiArrowGoBackLine size="18px" />
              </ActionButton>
            </div>
          </div>
          <div class="h-[60vh]">
            <div ref="dropRef" @drop="onDrop" @dragover="onDragover" class="h-full">
              <CodeEditor
                v-model:value="input"
                :language="inputLang"
                theme="vs"
                :options="options"
                height="100%"
                width="100%"
              />
            </div>
          </div>
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
            <span>{{ t('xml.output') }}</span>
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
          <div class="h-[60vh]">
            <CodeEditor
              v-model:value="output"
              language="xml"
              theme="vs"
              :options="outOptions"
              height="100%"
              width="100%"
            />
          </div>
          <div v-if="error" class="border-t p-2 text-sm text-red-600">{{ error }}</div>
        </div>
      </div>
    </template>
  </PageContainer>
</template>

<style scoped></style>
