## 目标
- 使用 `@remixicon/vue` 提供的 Vue 图标组件，统一图标风格与可访问性 [5]。
- 将主页与 `/tojson` 页面改造成 Dify 风格：简洁、卡片化、浅色背景、细边框、轻交互、图标+文案的清晰层级。

## 依赖与接入
- 安装：`npm i @remixicon/vue`
- 用法（示例）[5]：
  ```vue
  <script setup>
  import { RiBracesLine, RiArrowRightLine } from '@remixicon/vue'
  </script>
  <template>
    <RiBracesLine size="20px" class="text-blue-600" />
  </template>
  ```
- 无需额外 Vite 配置，直接在组件中按需导入使用。

## 设计语言（Dify 风格要点）
- 颜色与背景：
  - 页面背景：`bg-gray-50`
  - 卡片：`bg-white` + `border border-gray-200`，普通态无阴影，悬停轻微 `shadow-sm`
  - 主题色：以蓝（`text-blue-600`、`bg-blue-50`）为主，适度点缀
- 布局与层级：
  - 顶部简洁头部：品牌 + 轻操作按钮（后续可拓展）
  - 内容区使用网格卡片，卡片内信息分层：图标、标题、描述、次要说明
  - 交互克制：hover 态加轻微阴影与颜色强调，不用复杂动画
- 图标使用：
  - 工具卡片左侧图标（如 JSON 用 `RiBracesLine`），右侧引导箭头（`RiArrowRightLine`）
  - 页面标题前置工具图标，提升识别度

## 具体改造
- 主页 `src/pages/Home.vue`
  - 卡片头区：左侧大图标圆形浅色底、右侧标题与简述
  - 卡片悬停：`hover:shadow-sm hover:border-gray-300`
  - 按钮/引导：右下或右上加入箭头图标，`group-hover:text-blue-600`
  - 仅保留“JSON 格式化”一项，后续可扩展更多卡片
- toJson 页面 `src/pages/ToJson.vue`
  - 标题区：加入 `RiBracesLine` 图标与标题；“复制结果/清空输入”按钮改为浅色风格
  - 分割条：保持可拖拽，样式统一为 `bg-gray-200 hover:bg-gray-300 cursor-col-resize`
  - 初次只显示输入；出现结果后默认右 80%（已实现），视觉上右侧卡片更强调

## 代码变更点
- 新增/修改：
  - `src/pages/Home.vue`：替换头区与卡片为 Dify 风格，并使用 RemixIcon 组件
  - `src/pages/ToJson.vue`：在标题区与卡片内加入图标，微调按钮与色彩
  - 如需统一头部，新增 `src/components/AppHeader.vue`（后续可选）并在 `App.vue` 引入

## 参考
- RemixIcon Vue 用法与组件命名：[5] https://github.com/Remix-Design/RemixIcon
- Dify 风格特征：轻卡片、浅色背景、弱阴影、明确层级；通用卡片设计原则可参考行业文章 [1][2]

## 验证
- 主页视觉与交互统一为简洁卡片风，图标正确渲染
- `/tojson` 标题图标与按钮风格统一；输入后分割视图正常与拖拽可用

## 后续可选增强
- 夜间模式（Tailwind dark 类）
- 统一头部与左侧导航（图标+文字）
- 卡片分类筛选与搜索