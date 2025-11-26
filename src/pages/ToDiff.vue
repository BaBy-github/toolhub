<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { RiClipboardLine, RiArrowGoBackLine } from '@remixicon/vue'
import { editor } from 'monaco-editor'
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import ActionButton from '@/components/ActionButton.vue'

const original = ref('')
const modified = ref('')
const router = useRouter()
const containerRef = ref<HTMLElement | null>(null)
let diffEditor: editor.IStandaloneDiffEditor | null = null
let originalModel: editor.ITextModel | null = null
let modifiedModel: editor.ITextModel | null = null

const diffOptions = {
  theme: 'vs',
  minimap: { enabled: false },
  automaticLayout: true,
  readOnly: false,
  renderSideBySide: true,
  // 设置左侧最小宽度为20%
  diffEditor: {
    renderSideBySide: true,
    // Monaco Editor没有直接的分隔条限位配置，需要通过CSS或其他方式实现
  }
}

onMounted(() => {
  if (!containerRef.value) return
  
  // 创建差异编辑器
  diffEditor = editor.createDiffEditor(containerRef.value, diffOptions)
  
  // 创建模型
  originalModel = editor.createModel(original.value, 'text')
  modifiedModel = editor.createModel(modified.value, 'text')
  
  // 设置模型
  diffEditor.setModel({
    original: originalModel,
    modified: modifiedModel
  })
  
  // 确保原始内容编辑器可编辑
  const originalEditor = diffEditor.getOriginalEditor()
  originalEditor.updateOptions({ readOnly: false })
  
  // 确保修改后内容编辑器可编辑
  const modifiedEditor = diffEditor.getModifiedEditor()
  modifiedEditor.updateOptions({ readOnly: false })
  
  // 监听原始内容变化
  originalModel.onDidChangeContent(() => {
    original.value = originalModel?.getValue() || ''
  })
  
  // 监听修改后内容变化
  modifiedModel.onDidChangeContent(() => {
    modified.value = modifiedModel?.getValue() || ''
  })
  
  // 添加样式来限制左侧面板最小宽度和增强差异高亮效果
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
  `
  document.head.appendChild(style)
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
  const trimmedOriginal = original.value.trim()
  const trimmedModified = modified.value.trim()
  if (trimmedOriginal.length === 0 && trimmedModified.length === 0) router.push('/')
  else clearInput()
}
</script>

<template>
  <PageContainer>
    <PageHeader title="To Diff" @back="goBack" />
    <div class="card">
      <div class="toolbar flex justify-between">
        <span class="font-medium">内容A</span>
        <span class="font-medium">内容B</span>
      </div>
      <div 
        ref="containerRef" 
        class="h-[60vh] overflow-hidden"
        style="width: 100%; box-sizing: border-box;"
      ></div>
    </div>
  </PageContainer>
</template>

<style scoped></style>