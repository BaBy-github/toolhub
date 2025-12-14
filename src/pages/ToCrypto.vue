<script setup lang="ts">
import { ref, watch, computed, nextTick, onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslation } from 'i18next-vue'
import { RiClipboardLine, RiArrowGoBackLine, RiSettings3Line, RiRefreshLine } from '@remixicon/vue'

const { t } = useTranslation()
import CodeEditor from 'monaco-editor-vue3'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import ActionButton from '@/components/ActionButton.vue'
import { encryptString, decryptString, generateRandomKey, generateRandomIv } from '@/utils/crypto'
import { popToolState, getNextToolInput } from '@/utils/toolState'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

const input = ref('')
const output = ref('')
const error = ref('')
const showOutput = ref(false)
const leftRatio = ref(0.2)
const splitRef = ref<HTMLElement | null>(null)
const settingsContainer = ref<HTMLElement | null>(null)
const copied = ref(false)
const router = useRouter()
const isLoading = ref(true)
let timeoutId: number | null = null

// 加密设置
const showCryptoSettings = ref(false)
const isEncryptMode = ref(true) // true 表示加密模式，false 表示解密模式
const cryptoSettings = ref({
  algorithm: 'aes-256-cbc' as const,
  key: '',
  iv: '',
})

// 从toolState获取初始值
const nextInput = getNextToolInput()
if (nextInput) {
  input.value = nextInput
  // 自动展开输出
  showOutput.value = true
  // 立即处理输入值，生成输出
  processInput()
}

// 用于跟踪鼠标是否在设置区域内
let isMouseInSettings = false

// 处理鼠标进入设置区域
function handleSettingsMouseEnter() {
  isMouseInSettings = true
  showCryptoSettings.value = true
}

// 处理鼠标离开设置区域
function handleSettingsMouseLeave() {
  isMouseInSettings = false
  // 延迟关闭，确保鼠标有足够时间从按钮移动到下拉框
  setTimeout(() => {
    if (!isMouseInSettings) {
      showCryptoSettings.value = false
    }
  }, 100)
}

const options = {
  language: 'text',
  theme: 'vs',
  minimap: { enabled: false },
  automaticLayout: true,
  wordWrap: 'off',
}
const outOptions = {
  language: 'text',
  theme: 'vs',
  readOnly: true,
  minimap: { enabled: false },
  automaticLayout: true,
  wordWrap: 'on',
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

// 处理输入，生成输出
async function processInput() {
  const trimmed = input.value.trim()
  if (!trimmed) {
    output.value = ''
    error.value = ''
    return
  }

  // 记录当前模式，防止异步操作期间模式切换导致的竞态问题
  const currentMode = isEncryptMode.value

  try {
    if (currentMode) {
      const result = await encryptString(trimmed, cryptoSettings.value)
      // 只有当前模式仍然是加密模式时，才更新输出
      if (isEncryptMode.value === currentMode) {
        output.value = result
        error.value = ''
      }
    } else {
      const result = await decryptString(trimmed, cryptoSettings.value)
      // 只有当前模式仍然是解密模式时，才更新输出
      if (isEncryptMode.value === currentMode) {
        output.value = result
        error.value = ''
      }
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
    output.value = ''
  }
}

watch(input, (newVal, oldVal) => {
  const trimmed = newVal.trim()
  if (!showOutput.value && trimmed.length > 0) {
    showOutput.value = true
    leftRatio.value = 0.2
  } else if (showOutput.value && trimmed.length === 0) {
    showOutput.value = false
    error.value = ''
  }

  // 检测粘贴操作（输入长度突然增加很多）
  if (isFirstPaste.value && newVal.length - oldVal.length > 10) {
    showCryptoSettings.value = true
    isFirstPaste.value = false
  }

  if (timeoutId) clearTimeout(timeoutId as any)
  timeoutId = window.setTimeout(() => {
    processInput()
  }, 200)
})

// 监听加密设置变化
watch(
  cryptoSettings,
  () => {
    const trimmed = input.value.trim()
    if (trimmed) {
      processInput()
    }
  },
  { deep: true },
)

// 监听模式变化，重新处理输入值
watch(isEncryptMode, () => {
  // 先清空输出和错误，然后再重新计算
  output.value = ''
  error.value = ''
  const trimmed = input.value.trim()
  if (trimmed) {
    processInput()
  }
})

// 生成随机密钥
async function generateKey() {
  cryptoSettings.value.key = await generateRandomKey()
}

// 生成随机IV
function generateIv() {
  cryptoSettings.value.iv = generateRandomIv()
}

// 生成随机密钥和IV
async function generateKeyAndIv() {
  cryptoSettings.value.key = await generateRandomKey()
  cryptoSettings.value.iv = generateRandomIv()
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
    window.setTimeout(() => {
      copied.value = false
    }, 1000)
  } catch { }
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
      <PageHeader :title="t('crypto.title')" @back="goBack" />

      <div ref="splitRef" class="flex gap-0">
        <!-- 输入区域 -->
        <div class="card" :style="{ width: showOutput ? leftWidth : '100%' }">
          <div class="toolbar">
            <span>{{ t('common.input') }}</span>
            <div class="flex items-center">
              <!-- 加密/解密模式切换按钮 -->
              <button class="px-3 py-1 text-sm rounded-l-md transition-colors cursor-pointer" :class="isEncryptMode
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                " @click="isEncryptMode = !isEncryptMode">
                {{ isEncryptMode ? t('crypto.encrypt') : t('crypto.decrypt') }}
              </button>
              <!-- 加密设置下拉菜单 -->
              <div class="relative" ref="settingsContainer">
                <button
                  class="p-2 rounded-r-md hover:bg-gray-100 transition-colors cursor-pointer border-l border-gray-200"
                  :title="t('crypto.settings')" @click="showCryptoSettings = !showCryptoSettings"
                  @mouseenter="handleSettingsMouseEnter">
                  <RiSettings3Line size="18px" class="text-gray-600" />
                </button>

                <!-- 加密设置选项框 -->
                <div v-show="showCryptoSettings"
                  class="absolute right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-1000 transition-all duration-200 ease-in-out"
                  :class="{
                    'opacity-100 translate-y-0 scale-100': showCryptoSettings,
                    'opacity-0 translate-y-[-5px] scale-95 pointer-events-none':
                      !showCryptoSettings,
                  }" @mouseenter="handleSettingsMouseEnter" @mouseleave="handleSettingsMouseLeave">
                  <div class="p-3">
                    <div class="space-y-3">
                      <!-- 算法选择 -->
                      <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">{{
                          t('crypto.algorithm')
                          }}</label>
                        <select v-model="cryptoSettings.algorithm"
                          class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="aes-256-cbc">{{ t('crypto.algorithms.aes-256-cbc') }}</option>
                        </select>
                      </div>

                      <!-- 密钥设置 -->
                      <div class="space-y-1">
                        <div class="flex items-center justify-between">
                          <label class="block text-sm font-medium text-gray-700">{{
                            t('crypto.key')
                            }}</label>
                          <button @click="generateKey"
                            class="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            :title="t('crypto.generateKey')">
                            <RiRefreshLine size="16px" />
                          </button>
                        </div>
                        <input v-model="cryptoSettings.key" type="text" :placeholder="t('crypto.keyPlaceholder')"
                          class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>

                      <!-- IV设置 -->
                      <div class="space-y-1">
                        <div class="flex items-center justify-between">
                          <label class="block text-sm font-medium text-gray-700">{{
                            t('crypto.iv')
                            }}</label>
                          <button @click="generateIv"
                            class="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            :title="t('crypto.generateIv')">
                            <RiRefreshLine size="16px" />
                          </button>
                        </div>
                        <input v-model="cryptoSettings.iv" type="text" :placeholder="t('crypto.ivPlaceholder')"
                          class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>

                      <!-- 生成随机密钥和IV按钮 -->
                      <button @click="generateKeyAndIv"
                        class="w-full px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors">
                        {{ t('crypto.generateKeyAndIv') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="h-[60vh]">
            <CodeEditor v-model:value="input" :language="'text'" theme="vs" :options="options" height="100%"
              width="100%" />
          </div>
          <div class="p-2 text-sm">&#8203;</div>
        </div>

        <!-- 分割线 -->
        <div v-show="showOutput" class="w-[6px] bg-gray-200 hover:bg-gray-300 cursor-col-resize" @mousedown="beginDrag"
          @touchstart="beginDrag"></div>

        <!-- 输出区域 -->
        <div v-show="showOutput" class="relative card" :style="{ width: rightWidth }">
          <div class="toolbar">
            <span>{{ isEncryptMode ? t('crypto.output') : t('crypto.decryptOutput') }}</span>
            <div class="relative">
              <!-- 复制按钮 -->
              <ActionButton v-if="!copied" variant="ghost" title="复制" @click="copyOutput"
                class="transition-all duration-300">
                <RiClipboardLine size="18px" />
              </ActionButton>
              <!-- 已复制文字 -->
              <span v-else
                class="inline-flex items-center justify-center h-9 w-16 bg-green-100 text-green-800 text-xs font-medium rounded-2xl transition-all duration-300">
                {{ t('common.copied') }}
              </span>
            </div>
          </div>
          <div class="h-[60vh]">
            <CodeEditor v-model:value="output" :language="'text'" theme="vs" :options="outOptions" height="100%"
              width="100%" />
          </div>
          <div v-if="error" class="border-t p-2 text-sm text-red-600">{{ error }}</div>
          <div v-else class="p-2 text-sm">&#8203;</div>
        </div>
      </div>
    </template>
  </PageContainer>
</template>

<style scoped>
/* 优化表单元素样式 */
input[type='text'],
select {
  font-family: inherit;
}
</style>
