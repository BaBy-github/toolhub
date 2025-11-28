<script setup lang="ts">
import { ref, watch, computed, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { RiClipboardLine, RiArrowGoBackLine, RiSettings3Line } from '@remixicon/vue'
import CodeEditor from 'monaco-editor-vue3'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import ActionButton from '@/components/ActionButton.vue'
import { escapeString, unescapeString } from '@/utils/escape'
import { popToolState } from '@/utils/toolState'

const input = ref('')
const output = ref('')
const showOutput = ref(false)
const leftRatio = ref(0.2)
const splitRef = ref<HTMLElement | null>(null)
const copied = ref(false)
const router = useRouter()
let t: number | null = null

// 转义设置
const showEscapeSettings = ref(false)
const escapeSettings = ref({
  escapeDoubleQuotes: true,
  escapeSingleQuotes: true,
  escapeNewlines: true
})

const options = { language: 'text', theme: 'vs', minimap: { enabled: false }, automaticLayout: true, wordWrap: "off" }
const outOptions = { language: 'text', theme: 'vs', readOnly: true, minimap: { enabled: false }, automaticLayout: true, wordWrap: "on" }

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

// 监听输入变化，粘贴内容时默认展开设置
let isFirstPaste = ref(true)
watch(input, (newVal, oldVal) => {
  const trimmed = newVal.trim()
  if (!showOutput.value && trimmed.length > 0) {
    showOutput.value = true
    leftRatio.value = 0.2
  } else if (showOutput.value && trimmed.length === 0) {
    showOutput.value = false
  }
  
  // 检测粘贴操作（输入长度突然增加很多）
  if (isFirstPaste.value && newVal.length - oldVal.length > 10) {
    showEscapeSettings.value = true
    isFirstPaste.value = false
  }
  
  if (t) clearTimeout(t as any)
  t = window.setTimeout(() => {
    if (!trimmed) { output.value = ''; return }
    try {
      output.value = escapeString(trimmed, escapeSettings.value)
    } catch (e) {
      output.value = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`
    }
  }, 200)
})

// 监听转义设置变化
watch(escapeSettings, () => {
  const trimmed = input.value.trim()
  if (trimmed) {
    try {
      output.value = escapeString(trimmed, escapeSettings.value)
    } catch (e) {
      output.value = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`
    }
  }
}, { deep: true })

function toggleEscapeSettings() {
  showEscapeSettings.value = !showEscapeSettings.value
}

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
  const prevState = popToolState()
  if (prevState) {
    router.push(prevState.path)
  } else {
    router.push('/')
  }
}
</script>

<template>
  <PageContainer>
    <PageHeader title="字符串转义" @back="goBack" />
    

    
    <div ref="splitRef" class="flex gap-0">
      <!-- 输入区域 -->
      <div class="card" :style="{ width: showOutput ? leftWidth : '100%' }">
        <div class="toolbar">
          <span>输入</span>
          <ActionButton variant="ghost" title="转义设置" @click="toggleEscapeSettings">
            <RiSettings3Line size="18px" />
          </ActionButton>
        </div>
        
        <!-- 转义设置选项框 -->
        <div v-if="showEscapeSettings" class="mb-3 p-3 bg-gray-50 border rounded-md">
          <h3 class="mb-2 text-sm font-medium">转义设置</h3>
          <div class="space-y-2 text-sm">
            <label class="flex items-center gap-2">
              <input v-model="escapeSettings.escapeDoubleQuotes" type="checkbox" />
              <span>转义双引号（"）</span>
            </label>
            <label class="flex items-center gap-2">
              <input v-model="escapeSettings.escapeSingleQuotes" type="checkbox" />
              <span>转义单引号（'）</span>
            </label>
            <label class="flex items-center gap-2">
              <input v-model="escapeSettings.escapeNewlines" type="checkbox" />
              <span>转义换行符（\r\n）</span>
            </label>
          </div>
        </div>
        
        <div class="h-[60vh]">
          <CodeEditor v-model:value="input" :language="'text'" theme="vs" :options="options" height="100%" width="100%" />
        </div>
      </div>

      <!-- 分割线 -->
      <div v-show="showOutput" class="w-[6px] bg-gray-200 hover:bg-gray-300 cursor-col-resize" @mousedown="beginDrag" @touchstart="beginDrag"></div>

      <!-- 输出区域 -->
      <div v-show="showOutput" class="relative card" :style="{ width: rightWidth }">
        <div class="toolbar">
          <span>转义结果</span>
          <ActionButton variant="ghost" title="复制" @click="copyOutput">
            <RiClipboardLine size="18px" />
          </ActionButton>
          <span class="text-xs" v-show="copied">已复制</span>
        </div>
        <div class="h-[60vh]">
          <CodeEditor v-model:value="output" :language="'text'" theme="vs" :options="outOptions" height="100%" width="100%" />
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped></style>