## 目标
- 首次进入 `/tojson`：仅展示输入编辑器。
- 用户输入非空后：显示输出编辑器，默认占右侧 70%。
- 中间加入可横向拖拽的分界线，动态调整左右宽度。

## 代码改动范围
- 仅修改 `src/pages/ToJson.vue`，保持现有路由与样式不变。
- 关键引用：`monaco-editor-vue3` 的 `CodeEditor`，`formatJson` 工具。

## 交互实现
- 新增状态：
  - `showOutput: boolean` 首次从空到非空时置为 `true`；当输入再次为空时隐藏输出。
  - `leftRatio: number` 初始 `0.3`（左 30%，右 70%），范围限制 `0.2`～`0.95`。
  - `isDragging: boolean` 与 `splitRef: HTMLElement` 追踪拖拽与容器宽度。
- 拖拽逻辑：
  - 在分界线 `@mousedown/@touchstart` 时监听 `window` 的 `mousemove/touchmove` 与 `mouseup/touchend`。
  - 根据光标在容器内的 `clientX` 计算 `leftRatio = clamp(x / containerWidth)` 并更新视图；在 `nextTick` 后对编辑器调用 `layout()`（或依赖 `automaticLayout`）。
- 首屏与显示逻辑：
  - `v-if="!showOutput"` 渲染单列输入编辑器（全宽）。
  - `v-else` 使用 `flex` 布局渲染 `左面板 + 分界线 + 右面板`，通过 `:style="{ width: leftWidth }"`/`{ width: rightWidth }`` 控制宽度。
  - 顶部按钮区：当 `showOutput` 为 `true` 时显示“复制结果”，否则只显示“清空输入”。

## 样式与可用性
- 分界线：宽 `6px`，`cursor-col-resize`，悬停变色；支持触控拖拽。
- 容器高度维持 `60vh`，两侧卡片保持圆角、阴影与分隔标题；编辑器 `automaticLayout: true`。

## 代码示意
- 关键状态与拖拽：
```ts
const showOutput = ref(false)
const leftRatio = ref(0.3)
const splitRef = ref<HTMLElement>()
function beginDrag(e: MouseEvent | TouchEvent) { /* 监听 window 并更新 leftRatio */ }
const leftWidth = computed(() => `${Math.round(leftRatio.value * 100)}%`)
const rightWidth = computed(() => `${100 - Math.round(leftRatio.value * 100)}%`)
watch(input, v => { const t = v.trim(); showOutput.value = t.length > 0; /* formatJson */ })
```
- 模板切换：
```vue
<div ref="splitRef" class="h-[60vh] flex" v-if="showOutput">
  <div class="rounded border bg-white shadow-sm overflow-hidden" :style="{ width: leftWidth }"> ...left editor... </div>
  <div class="w-[6px] bg-gray-200 hover:bg-gray-300 cursor-col-resize" @mousedown="beginDrag" @touchstart="beginDrag"></div>
  <div class="rounded border bg-white shadow-sm overflow-hidden" :style="{ width: rightWidth }"> ...right editor... </div>
</div>
<div v-else class="h-[60vh]"> ...single left editor full width... </div>
```

## 验证
- 打开 `/toolhub/tojson`：初始仅显示输入框。
- 粘贴或输入任意数据：右侧结果框出现并占 70%，格式化实时更新。
- 拖动分界线：左右比例跟随变化，编辑器内容与布局保持正常。

## 兼容与注意
- 若浏览器缩放或容器大小变化，`automaticLayout` 能自动处理；拖拽后也可手动 `layout()` 提升稳定性。
- 移动端触控采用 `touchstart/move/end` 简化支持。