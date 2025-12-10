<script setup lang="ts">
import { ref, watch, computed, nextTick, onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslation } from 'i18next-vue'
import { RiClipboardLine, RiArrowGoBackLine, RiSettings3Line } from '@remixicon/vue'

const { t } = useTranslation()
import CodeEditor from 'monaco-editor-vue3'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import ActionButton from '@/components/ActionButton.vue'
import { escapeString, unescapeString } from '@/utils/escape'
import { popToolState, getNextToolInput } from '@/utils/toolState'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

const input = ref('')
const output = ref('')
const showOutput = ref(false)
const leftRatio = ref(0.2)
const splitRef = ref<HTMLElement | null>(null)
const settingsContainer = ref<HTMLElement | null>(null)
const copied = ref(false)
const router = useRouter()
const isLoading = ref(true)
let timeoutId: number | null = null

// 转义设置
const showEscapeSettings = ref(false)
const isEscapeMode = ref(true) // true 表示转义模式，false 表示反转义模式
const escapeSettings = ref({
  escapeDoubleQuotes: true,
  escapeSingleQuotes: true,
  escapeNewlines: true
})

// 从toolState获取初始值
const nextInput = getNextToolInput()
if (nextInput) {
  input.value = nextInput
  // 自动展开输出
  showOutput.value = true
  // 立即处理输入值，生成输出
  try {
    output.value = isEscapeMode.value ? escapeString(nextInput, escapeSettings.value) : unescapeString(nextInput, escapeSettings.value)
  } catch (e) {
    output.value = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`
  }
}

// 用于跟踪鼠标是否在设置区域内
let isMouseInSettings = false

// 处理鼠标进入设置区域
function handleSettingsMouseEnter() {
  isMouseInSettings = true
  showEscapeSettings.value = true
}

// 处理鼠标离开设置区域
function handleSettingsMouseLeave() {
  isMouseInSettings = false
  // 延迟关闭，确保鼠标有足够时间从按钮移动到下拉框
  setTimeout(() => {
    if (!isMouseInSettings) {
      showEscapeSettings.value = false
    }
  }, 100)
}

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

// 添加onMounted钩子，设置isLoading为false
onMounted(() => {
  // 内容加载完成，隐藏骨架屏
  isLoading.value = false
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
  
  if (timeoutId) clearTimeout(timeoutId as any)
  timeoutId = window.setTimeout(() => {
    if (!trimmed) { output.value = ''; return }
    try {
      output.value = isEscapeMode.value ? escapeString(trimmed, escapeSettings.value) : unescapeString(trimmed, escapeSettings.value)
    } catch (e) {
      output.value = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`
    }
  }, 200)
})

// 监听转义设置变化
watch(escapeSettings, () => {
  const trimmed = input.value.trim()
  if (trimmed && isEscapeMode.value) {
    try {
      output.value = escapeString(trimmed, escapeSettings.value)
    } catch (e) {
      output.value = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`
    }
  }
}, { deep: true })

// 监听模式变化，重新处理输入值
watch(isEscapeMode, () => {
  const trimmed = input.value.trim()
  if (trimmed) {
    try {
      output.value = isEscapeMode.value ? escapeString(trimmed, escapeSettings.value) : unescapeString(trimmed, escapeSettings.value)
    } catch (e) {
      output.value = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`
    }
  }
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
    router.push(prevState.path)
  } else {
    router.push('/')
  }
}
</script>

<template>
  <PageContainer>
    <template v-if="isLoading">
      <SkeletonLoader />
    </template>
    <template v-else>
      <PageHeader :title="t('escape.title')" @back="goBack" />
      
      <div ref="splitRef" class="flex gap-0">
        <!-- 输入区域 -->
        <div class="card" :style="{ width: showOutput ? leftWidth : '100%' }">
          <div class="toolbar">
            <span>{{ t('common.input') }}</span>
            <div class="flex items-center">
              <!-- 转义/反转义模式切换按钮 -->
              <button 
                class="px-3 py-1 text-sm rounded-l-md transition-colors cursor-pointer"
                :class="isEscapeMode ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'bg-green-100 text-green-800 hover:bg-green-200'"
                @click="isEscapeMode = !isEscapeMode"
              >
                {{ isEscapeMode ? t('escape.escape') : t('escape.unescape') }}
              </button>
              <!-- 转义设置下拉菜单 - 重构版本 -->
              <div class="relative" ref="settingsContainer">
              <button 
                class="p-2 rounded-r-md hover:bg-gray-100 transition-colors cursor-pointer border-l border-gray-200"
                :title="t('escape.settings')"
                @click="showEscapeSettings = !showEscapeSettings"
                @mouseenter="handleSettingsMouseEnter"
              >
                <RiSettings3Line size="18px" class="text-gray-600" />
              </button>
              
              <!-- 转义设置选项框 -->
              <div 
                v-show="showEscapeSettings" 
                class="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-1000 transition-all duration-200 ease-in-out"
                :class="{ 'opacity-100 translate-y-0 scale-100': showEscapeSettings, 'opacity-0 translate-y-[-5px] scale-95 pointer-events-none': !showEscapeSettings }"
                @mouseenter="handleSettingsMouseEnter"
                @mouseleave="handleSettingsMouseLeave"
              >
                <div class="p-3">
                  <div class="space-y-2">
                    <label class="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-md transition-colors">
                      <input v-model="escapeSettings.escapeDoubleQuotes" type="checkbox" class="rounded text-blue-600 focus:ring-blue-500" />
                      <span class="text-sm text-gray-700">{{ isEscapeMode ? t('escape.escapeDoubleQuotes') : t('escape.unescapeDoubleQuotes') }}</span>
                      <span class="text-xs text-gray-400">{{ isEscapeMode ? '&quot; → \\&quot;' : '\\&quot; → &quot;' }}</span>
                    </label>
                    <label class="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-md transition-colors">
                      <input v-model="escapeSettings.escapeSingleQuotes" type="checkbox" class="rounded text-blue-600 focus:ring-blue-500" />
                      <span class="text-sm text-gray-700">{{ isEscapeMode ? t('escape.escapeSingleQuotes') : t('escape.unescapeSingleQuotes') }}</span>
                      <span class="text-xs text-gray-400">{{ isEscapeMode ? "' → \\'" : "\\' → '" }}</span>
                    </label>
                    <label class="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 rounded-md transition-colors">
                      <input v-model="escapeSettings.escapeNewlines" type="checkbox" class="rounded text-blue-600 focus:ring-blue-500" />
                      <span class="text-sm text-gray-700">{{ isEscapeMode ? t('escape.escapeNewlines') : t('escape.unescapeNewlines') }}</span>
                      <span class="text-xs text-gray-400">{{ isEscapeMode ? '↵ → \\n' : '\\n → ↵' }}</span>
                    </label>
                  </div>
                </div>
              </div>
              </div>
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
            <span>{{ isEscapeMode ? t('escape.output') : t('escape.unescapeOutput') }}</span>
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
            <CodeEditor v-model:value="output" :language="'text'" theme="vs" :options="outOptions" height="100%" width="100%" />
          </div>
        </div>
      </div>
    </template>
  </PageContainer>
</template>

<style scoped>
/* 优化复选框样式 */
input[type="checkbox"] {
  accent-color: #3b82f6;
  cursor: pointer;
}
</style>
