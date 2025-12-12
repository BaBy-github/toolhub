import { useRouter, useRoute } from 'vue-router'
import { pushToolState, popToolState, getNextToolInput, setNextToolInput } from '@/utils/toolState'

/**
 * 工具状态管理的composable
 * @returns 工具状态管理相关的函数和状态
 */
export function useToolState() {
  const router = useRouter()
  const route = useRoute()

  /**
   * 获取初始输入值
   * @returns 初始输入值，如果没有则返回空字符串
   */
  function getInitialInput(): string {
    const nextInput = getNextToolInput()
    if (nextInput) {
      return nextInput
    } else if (route.query.input) {
      return route.query.input as string
    }
    return ''
  }

  /**
   * 返回上一个工具
   * @param currentPath 当前工具的路径
   * @param currentState 当前工具的状态
   */
  function goBack(currentPath: string, currentState?: any) {
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

  /**
   * 跳转到另一个工具
   * @param targetPath 目标工具的路径
   * @param currentPath 当前工具的路径
   * @param currentState 当前工具的状态
   * @param output 当前工具的输出值
   */
  function navigateToTool(
    targetPath: string,
    currentPath: string,
    currentState: any,
    output: string,
  ) {
    // 保存当前状态
    pushToolState({
      path: currentPath,
      ...currentState,
    })

    // 使用toolState传递值，而不是URL query参数
    setNextToolInput(output)

    // 跳转到目标工具页面
    router.push({
      path: targetPath,
    })
  }

  return {
    getInitialInput,
    goBack,
    navigateToTool,
  }
}
