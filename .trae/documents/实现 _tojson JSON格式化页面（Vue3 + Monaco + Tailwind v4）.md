## 目标
- 构建一个单页面应用，默认跳转到 `/tojson`。
- 在 `/tojson` 页面提供左侧输入、右侧实时格式化输出的双栏体验。
- 技术栈：Vue 3、Vue Router、Monaco Editor、Tailwind CSS v4。

## 依赖与样式
- 安装依赖：
  - 运行：`npm i monaco-editor monaco-editor-vue3`
  - 开发：`npm i -D tailwindcss @tailwindcss/vite`
- 新增样式入口：`src/style.css` 内容：
  ```css
  @import "tailwindcss";
  ```
- 在 `src/main.ts` 引入：
  ```ts
  import './style.css'
  ```
- 在 `vite.config.ts` 启用 Tailwind v4 官方 Vite 插件：
  ```ts
  import tailwindcss from '@tailwindcss/vite'
  // plugins: [vue(), vueJsx(), vueDevTools(), tailwindcss()]
  ```
- 参考：Tailwind v4 与 Vite 集成的官方/社区指南 [1][3][4]

## 路由与入口
- 更新 `src/router/index.ts`，设置默认重定向与新页面路由：
  ```ts
  import { createRouter, createWebHistory } from 'vue-router'
  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
      { path: '/', redirect: '/tojson' },
      { path: '/tojson', component: () => import('@/pages/ToJson.vue') },
    ],
  })
  export default router
  ```
- 更新 `src/App.vue`，使用路由占位：
  ```vue
  <template>
    <router-view />
  </template>
  ```

## 页面结构（简洁好看）
- 新增 `src/pages/ToJson.vue`：
  - 布局：`grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 max-w-7xl mx-auto`。
  - 顶部操作区：标题、`复制结果`、`清空输入`。
  - 左栏：Monaco 可编辑输入。
  - 右栏：Monaco 只读输出，底部错误信息条。
  - 主要样式：浅灰背景、白卡片、圆角、边框、间距；Tailwind v4 原子类。
- 示例实现：
  ```vue
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  import { CodeEditor } from 'monaco-editor-vue3'
  import { formatJson } from '@/utils/format'
  const input = ref('')
  const output = ref('')
  const error = ref('')
  const options = { language: 'json', theme: 'vs', minimap: { enabled: false } }
  const outOptions = { language: 'json', theme: 'vs', readOnly: true, minimap: { enabled: false } }
  let t: number | null = null
  watch(input, (v) => {
    if (t) clearTimeout(t as any)
    t = window.setTimeout(() => {
      const r = formatJson(v, { indent: 2, sortKeys: false })
      if (r.ok) { output.value = r.formatted as string; error.value = '' }
      else { output.value = ''; error.value = r.error as string }
    }, 200)
  })
  function clearInput() { input.value = '' }
  function copyOutput() { navigator.clipboard.writeText(output.value) }
  </script>
  <template>
    <div class="min-h-screen bg-gray-50">
      <div class="mx-auto max-w-7xl p-4">
        <div class="mb-4 flex items-center justify-between">
          <h1 class="text-xl font-semibold">JSON格式化</h1>
          <div class="flex gap-2">
            <button class="rounded bg-blue-600 px-3 py-1.5 text-white" @click="copyOutput">复制结果</button>
            <button class="rounded bg-gray-200 px-3 py-1.5" @click="clearInput">清空输入</button>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div class="rounded border bg-white">
            <CodeEditor v-model="input" :options="options" style="height:60vh" />
          </div>
          <div class="rounded border bg-white">
            <CodeEditor v-model="output" :options="outOptions" style="height:60vh" />
            <div v-if="error" class="border-t p-2 text-sm text-red-600">{{ error }}</div>
          </div>
        </div>
      </div>
    </div>
  </template>
  ```

## 格式化逻辑
- 新增 `src/utils/format.ts`，统一处理输入为 JSON 的解析与格式化：
  ```ts
  export type FormatOptions = { indent?: number; sortKeys?: boolean }
  export type FormatResult = { ok: boolean; formatted?: string; error?: string }
  export function formatJson(input: string, opts: FormatOptions = {}): FormatResult {
    const indent = typeof opts.indent === 'number' ? opts.indent : 2
    const sortKeys = !!opts.sortKeys
    const tryParse = (s: string) => { try { return { obj: JSON.parse(s) } } catch (e) { return { err: e as Error } } }
    let s = input?.trim() ?? ''
    if (!s) return { ok: true, formatted: '' }
    let parsed = tryParse(s)
    if (!parsed.obj) { try { const unescaped = JSON.parse(s); parsed = tryParse(unescaped) } catch {} }
    if (!parsed.obj) { if (/^[\s\S]*[‘’']/.test(s)) { s = s.replace(/'/g, '"'); parsed = tryParse(s) } }
    if (!parsed.obj) { s = s.replace(/,\s*([}\]])/g, '$1'); parsed = tryParse(s) }
    if (!parsed.obj) { return { ok: false, error: '无法解析为JSON' } }
    const obj = parsed.obj as any
    const stable = sortKeys ? sort(obj) : obj
    try { return { ok: true, formatted: JSON.stringify(stable, null, indent) } } catch { return { ok: false, error: '格式化失败' } }
  }
  function sort(v: any): any {
    if (Array.isArray(v)) return v.map(sort)
    if (v && typeof v === 'object') { const keys = Object.keys(v).sort(); const o: any = {}; for (const k of keys) o[k] = sort(v[k]); return o }
    return v
  }
  ```
- 策略：
  - 直接 `JSON.parse`。
  - 若是双重转义，先 `JSON.parse` 得到未转义字符串再解析一次。
  - 若使用单引号，尝试替换为双引号。
  - 去除对象/数组尾逗号。
  - 可选按键名排序以获得稳定输出。

## 交互与体验
- 实时格式化，200ms 防抖。
- 清空与复制按钮。
- 输出区只读，显示错误原因。
- 默认语言设为 `json`，主题 `vs`，关闭 minimap。
- 响应式：小屏单列、大屏双列。

## 部署与路径
- 现有 `vite.config.ts` 已设置 `base: '/toolhub/'`，部署后路由为 `/toolhub/tojson`；开发环境仍为 `/tojson`。

## 验证
- 本地运行：`npm run dev`，访问 `/tojson`。
- 用以下输入自测：
  - 合法 JSON：`{"a":1,"b":[2,3]}`。
  - 双重转义：`'{\"a\":1}'`。
  - 单引号 JSON：`{'a':1}`。
  - 尾逗号：`{"a":1,}`。
- 预期右侧输出为缩进良好的 JSON，错误时显示原因。

## 参考
- [1] Tailwind v4 + Vite 集成说明：https://dev.to/osalumense/install-tailwind-css-v4-in-a-vue-3-vite-project-319g
- [3] Vite 集成 Tailwind v4 插件指南：https://tailkits.com/blog/install-tailwind-css-with-vite/
- [4] Tailwind v4 在 Vue+Vite 的示例配置：https://www.alibabacloud.com/blog/setting-up-tailwind-css-4-0-in-vue-js-a-step-by-step-guide_602136
- Monaco 选择：直接用 `monaco-editor` 或社区 Vue 封装（如 `monaco-editor-vue3`），避免额外 Vite worker 插件复杂度 [2][5]
- [2] https://stackoverflow.com/questions/78431576/how-to-integrating-monaco-editor-with-vite-vue3-project
- [5] https://github.com/bazingaedward/monaco-editor-vue3
