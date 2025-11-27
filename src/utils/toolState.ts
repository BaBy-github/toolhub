import type { Ref } from 'vue'

// 工具状态接口
export interface ToolState {
  path: string
  input: string
  output?: string
  showOutput?: boolean
  leftRatio?: number
  viewMode?: string
}

// 工具状态栈
const toolStateStack: ToolState[] = []

/**
 * 保存当前工具状态到栈中
 * @param state 当前工具状态
 */
export function pushToolState(state: ToolState): void {
  toolStateStack.push(state)
}

/**
 * 从栈中弹出并返回上一个工具状态
 * @returns 上一个工具状态，如果栈为空则返回null
 */
export function popToolState(): ToolState | null {
  if (toolStateStack.length === 0) return null
  const state = toolStateStack.pop()
  return state || null
}

/**
 * 获取当前栈顶的工具状态
 * @returns 当前栈顶的工具状态，如果栈为空则返回null
 */
export function getCurrentToolState(): ToolState | null {
  if (toolStateStack.length === 0) return null
  const state = toolStateStack[toolStateStack.length - 1]
  return state || null
}

/**
 * 清空工具状态栈
 */
export function clearToolStateStack(): void {
  toolStateStack.length = 0
}

/**
 * 初始化工具状态
 * @param path 工具路径
 * @param initialInput 初始输入值
 * @returns 初始化后的工具状态
 */
export function initToolState(path: string, initialInput: string = ''): ToolState {
  return {
    path,
    input: initialInput,
    showOutput: false,
    leftRatio: 0.2,
    viewMode: 'code'
  }
}
