<script setup lang="ts">
import { ref, watch, computed, nextTick, onBeforeUnmount, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTranslation } from 'i18next-vue'
import { RiClipboardLine, RiArrowGoBackLine } from '@remixicon/vue'

const { t } = useTranslation()
import CodeEditor from 'monaco-editor-vue3'
import JsonColumns from '@/components/JsonColumns.vue'
import { JsonTreeView } from 'json-tree-view-vue3'
import { formatJson } from '@/utils/format'
import { pushToolState, popToolState, getNextToolInput, setNextToolInput } from '@/utils/toolState'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import ActionButton from '@/components/ActionButton.vue'
import ConversionButton from '@/components/ConversionButton.vue'

const input = ref('')
const output = ref('')
const error = ref('')
const showOutput = ref(false)
const leftRatio = ref(0.2)
const splitRef = ref<HTMLElement | null>(null)
const copied = ref(false)
const viewMode = ref<'code' | 'tree' | 'columns'>('code')
const router = useRouter()
const route = useRoute()
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

onMounted(() => {
  // 如果有初始输入值，自动显示输出框并计算输出
  if (input.value.trim()) {
    showOutput.value = true
    handleInputChange(input.value)
  }
})

watch(leftRatio, async () => {
  await nextTick()
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
    if (!trimmed) { output.value = ''; error.value = '' ; return }
    const r = formatJson(v, { indent: 2, sortKeys: false })
    if (r.ok) { output.value = r.formatted as string; error.value = '' }
    else { output.value = ''; error.value = r.error as string }
  }, 200)
}

watch(input, (v) => {
  handleInputChange(v)
})

const inputLang = computed(() => {
  const s = input.value.trim()
  const isXml = /^<([A-Za-z_][\w\-\.:]*)[\s\S]*>\s*$/.test(s)
  return isXml ? 'xml' : 'json'
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
    window.setTimeout(() => { copied.value = false }, 1000)
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

function goToDiff() {
  // 保存当前状态
  pushToolState({
    path: '/2json',
    input: input.value,
    output: output.value,
    showOutput: showOutput.value,
    leftRatio: leftRatio.value,
    viewMode: viewMode.value
  })
  
  // 使用toolState传递值，而不是URL query参数
  setNextToolInput(output.value)
  
  // 跳转到ToDiff页面
  router.push({
    path: '/2diff'
  })
}

function goToXml() {
  // 保存当前状态
  pushToolState({
    path: '/2json',
    input: input.value,
    output: output.value,
    showOutput: showOutput.value,
    leftRatio: leftRatio.value,
    viewMode: viewMode.value
  })
  
  // 使用toolState传递值，而不是URL query参数
  setNextToolInput(output.value)
  
  // 跳转到ToXml页面
  router.push({
    path: '/2xml'
  })
}
</script>

<template>
  <PageContainer>
    <PageHeader :title="t('json.title')" @back="goBack">
      <template #actions>
        <ConversionButton 
          current-tool="json"
          :conversions="[
            {
              name: 'diff',
              label: 'To Diff',
              path: '/2diff',
              icon: 'Δ',
              color: '#f97316'
            },
            {
              name: 'xml',
              label: 'To Xml',
              path: '/2xml',
              icon: 'XML',
              color: '#9333ea'
            },
            {
              name: 'escape',
              label: 'To Escape',
              path: '/2escape',
              icon: '\\',
              color: '#10b981'
            }
          ]"
          @conversion="(conversion) => {
            // 保存当前状态
            pushToolState({
              path: '/2json',
              input: input,
              output: output,
              showOutput: showOutput,
              leftRatio: leftRatio,
              viewMode: viewMode
            })
            // 使用toolState传递值，而不是URL query参数
            setNextToolInput(output)
            // 跳转到目标工具页面
            router.push({
              path: conversion.path
            })
          }"
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
            <CodeEditor v-model:value="input" :language="inputLang" theme="vs" :options="options" height="100%" width="100%" />
          </div>
        </div>

        <!-- 分割线 -->
        <div v-show="showOutput" class="w-[6px] bg-gray-200 hover:bg-gray-300 cursor-col-resize" @mousedown="beginDrag" @touchstart="beginDrag"></div>

        <!-- 输出区域 -->
        <div v-show="showOutput" class="relative card" :style="{ width: rightWidth }">
          <div class="toolbar">
            <span>{{ t('common.output') }}</span>
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
            <CodeEditor v-if="viewMode==='code'" v-model:value="output" language="json" theme="vs" :options="outOptions" height="100%" width="100%" />
            <div v-else-if="viewMode==='tree'" class="h-full overflow-auto text-xs leading-tight json-tree-compact">
              <JsonTreeView :json="output || ''" :maxDepth="4" />
            </div>
            <JsonColumns v-else :value="output ? JSON.parse(output) : null" />
            <div class="absolute right-2 bottom-2">
              <div class="flex rounded-lg border overflow-hidden bg-white">
                <button :class="['px-2 py-1 text-xs', viewMode==='code' ? 'bg-blue-600 text-white' : 'btn-ghost']" @click="viewMode='code'"> {{ t('common.code') }}</button>
                <button :class="['px-2 py-1 text-xs', viewMode==='tree' ? 'bg-blue-600 text-white' : 'btn-ghost']" @click="viewMode='tree'"> {{ t('common.tree') }}</button>
                <button :class="['px-2 py-1 text-xs', viewMode==='columns' ? 'bg-blue-600 text-white' : 'btn-ghost']" @click="viewMode='columns'"> {{ t('common.columns') }}</button>
              </div>
            </div>
          </div>
          <div v-if="error" class="border-t p-2 text-sm text-red-600">{{ error }}</div>
        </div>
      </div>
  </PageContainer>
</template>

<style scoped></style>
