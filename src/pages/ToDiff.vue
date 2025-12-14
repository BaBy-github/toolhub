<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTranslation } from 'i18next-vue'
import { RiClipboardLine, RiArrowGoBackLine } from '@remixicon/vue'
import { editor } from 'monaco-editor'
import { popToolState, getNextToolInput, setNextToolInput } from '@/utils/toolState'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import ActionButton from '@/components/ActionButton.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

const { t } = useTranslation()

const original = ref('')
const modified = ref('')
const router = useRouter()
const route = useRoute()
const containerRef = ref<HTMLElement | null>(null)
const isLoading = ref(true)
let diffEditor: editor.IStandaloneDiffEditor | null = null
let originalModel: editor.ITextModel | null = null
let modifiedModel: editor.ITextModel | null = null

// 从toolState获取初始值
const nextInput = getNextToolInput()
if (nextInput) {
  original.value = nextInput
}

const diffOptions = {
  theme: 'vs',
  minimap: { enabled: false },
  automaticLayout: true,
  renderSideBySide: true,
  // 设置左侧最小宽度为20%
  diffEditor: {
    renderSideBySide: true,
    // Monaco Editor没有直接的分隔条限位配置，需要通过CSS或其他方式实现
  },
}

onMounted(() => {
  // 添加样式来限制左侧面板最小宽度、增强差异高亮效果和改进箭头样式
  const style = document.createElement('style')
  style.textContent = `
    /* 限制Monaco差异编辑器左侧面板的最小宽度为20% */
    .monaco-diff-editor .editor.original {
      min-width: 20% !important;
    }
    
    /* 限制Monaco差异编辑器右侧面板的最小宽度为20% */
    .monaco-diff-editor .editor.modified {
      min-width: 20% !important;
    }
    
    /* 增强差异高亮效果，让不同内容的字符颜色更深 */
    .monaco-editor .diff.inserted {
      background-color: rgba(16, 185, 129, 0.2) !important;
      color: #059669 !important;
      font-weight: 600 !important;
    }
    
    .monaco-editor .diff.deleted {
      background-color: rgba(239, 68, 68, 0.2) !important;
      color: #dc2626 !important;
      font-weight: 600 !important;
    }
    
    .monaco-editor .diff.changed {
      background-color: rgba(251, 191, 36, 0.2) !important;
      color: #d97706 !important;
      font-weight: 600 !important;
    }
    
    /* 改进差异箭头样式，参考IDEA的合并样式 */
    .monaco-diff-editor .diff-arrow {
      background-color: rgba(100, 100, 100, 0.1) !important;
      border-radius: 4px !important;
      border: 1px solid rgba(100, 100, 100, 0.3) !important;
      width: 24px !important;
      height: 24px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin-top: -12px !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
    }
    
    .monaco-diff-editor .diff-arrow:before {
      color: #64748b !important;
      font-size: 14px !important;
      font-weight: bold !important;
    }
    
    /* 改进差异区域的样式 */
    .monaco-diff-editor .diff-insert {
      background-color: rgba(16, 185, 129, 0.1) !important;
    }
    
    .monaco-diff-editor .diff-delete {
      background-color: rgba(239, 68, 68, 0.1) !important;
    }
  `
  document.head.appendChild(style)

  // 内容加载完成，隐藏骨架屏
  isLoading.value = false

  // 只有当containerRef存在时才创建编辑器
  if (containerRef.value) {
    // 创建差异编辑器
    diffEditor = editor.createDiffEditor(containerRef.value, diffOptions)

    // 创建模型
    originalModel = editor.createModel(original.value, 'text')
    modifiedModel = editor.createModel(modified.value, 'text')

    // 设置模型
    diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel,
    })

    // 确保原始内容编辑器可编辑
    const originalEditor = diffEditor.getOriginalEditor()
    originalEditor.updateOptions({ readOnly: false, cursorBlinking: 'blink' })

    // 确保修改后内容编辑器可编辑
    const modifiedEditor = diffEditor.getModifiedEditor()
    modifiedEditor.updateOptions({ readOnly: false, cursorBlinking: 'blink' })

    // 立即聚焦到原始编辑器，确保可以输入
    originalEditor.focus()

    // 监听原始内容变化
    originalModel.onDidChangeContent(() => {
      original.value = originalModel?.getValue() || ''
    })

    // 监听修改后内容变化
    modifiedModel.onDidChangeContent(() => {
      modified.value = modifiedModel?.getValue() || ''
    })
  }
})

onUnmounted(() => {
  // 销毁模型
  originalModel?.dispose()
  modifiedModel?.dispose()

  // 销毁编辑器
  diffEditor?.dispose()
})

function clearInput() {
  original.value = ''
  modified.value = ''
  originalModel?.setValue('')
  modifiedModel?.setValue('')
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
</script>

<template>
  <PageContainer>
    <PageHeader :title="t('diff.title')" @back="goBack" />
    <div class="card">
      <!-- 采用Tailwind CSS UI Blocks设计风格的标题区域 -->
      <div
        class="toolbar flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-t-lg"
      >
        <div class="flex items-center gap-3">
          <div
            class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm"
          >
            A
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('diff.contentA') }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ t('home.toDiff.description') }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div
            class="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm"
          >
            B
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('diff.contentB') }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ t('home.toDiff.description') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Diff编辑器 -->
      <div class="relative">
        <div
          ref="containerRef"
          class="h-[60vh] overflow-hidden"
          style="width: 100%; box-sizing: border-box"
        >
          <template v-if="isLoading">
            <SkeletonLoader />
          </template>
        </div>
        <div class="p-2 text-sm">&#8203;</div>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped></style>
