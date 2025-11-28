import { ref, watch, computed } from 'vue'

/**
 * 编辑器状态管理的composable
 * @returns 编辑器状态管理相关的函数和状态
 */
export function useEditorState() {
  const input = ref('')
  const output = ref('')
  const error = ref('')
  const showOutput = ref(false)
  const history = ref<string[]>([''])
  const cursor = ref(0)
  const applying = ref(false)

  /**
   * 计算是否可以撤销
   */
  const canUndo = computed(() => cursor.value > 0)

  /**
   * 处理输入变化
   * @param v 输入值
   */
  function handleInputChange(v: string) {
    const trimmed = v.trim()
    pushHistory(v)
    if (!showOutput.value && trimmed.length > 0) {
      showOutput.value = true
    } else if (showOutput.value && trimmed.length === 0) {
      showOutput.value = false
    }
  }

  /**
   * 推送历史记录
   * @param v 当前输入值
   */
  function pushHistory(v: string) {
    if (applying.value) return
    const cur = cursor.value
    if (cur < history.value.length - 1) history.value = history.value.slice(0, cur + 1)
    if (history.value[history.value.length - 1] !== v) {
      history.value.push(v)
      cursor.value = history.value.length - 1
    }
  }

  /**
   * 撤销操作
   */
  function undo() {
    if (cursor.value <= 0) return
    cursor.value = cursor.value - 1
    applying.value = true
    input.value = history.value[cursor.value] || ''
    applying.value = false
  }

  return {
    input,
    output,
    error,
    showOutput,
    history,
    cursor,
    applying,
    canUndo,
    handleInputChange,
    pushHistory,
    undo
  }
}
