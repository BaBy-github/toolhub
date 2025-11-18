## 问题概述
- 开发服务报错：`monacoEditorPlugin is not a function`/`default is not a function`，来源于引入 `vite-plugin-monaco-editor` 与 Vite 版本不兼容。
- 浏览器报错：`You must define MonacoEnvironment.getWorkerUrl or MonacoEnvironment.getWorker`，Monaco worker 未配置。
- Node 版本提示：当前 Node `22.11.0`，Vite 要求 `20.19+ 或 22.12+`，会产生警告但并非致命。

## 修复方案
1. 移除 `vite-plugin-monaco-editor` 集成：恢复 `vite.config.ts`，不再使用该插件（与 Vite 7 不兼容）。
2. 在模块上下文配置 Monaco worker：在 `src/main.ts` 顶层设置 `self.MonacoEnvironment.getWorker(...)`，使用 `new URL('monaco-editor/esm/vs/...worker.js', import.meta.url)` 创建对应的 Worker（`json` 与通用 `editor`）。
3. 保持现有页面逻辑（ToJson 的分割与交互）不变。
4. 启动开发服务并验证：访问 `/toolhub/` 与 `/toolhub/tojson`，确保编辑器渲染且无 worker 报错。

## 兼容性说明
- 该方式为官方推荐的 Vite + Monaco 配置路径之一，避免老旧插件的兼容性问题。
- 如后续需要更多语言支持，可在 `getWorker` 中添加对应 label 分支。

## 备选方案（若仍有问题）
- 使用 `@guolao/vue-monaco-editor` 的 CDN 加载模式，完全绕过 bundling 的 worker 问题。
- 升级 Node 至 `22.12+`，消除 Vite 的版本警告。

## 输出
- 提交代码修改并重启开发服务，验证页面正常打开与编辑器工作。