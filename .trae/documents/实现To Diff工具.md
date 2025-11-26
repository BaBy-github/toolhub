# 实现To Diff工具

## 需求分析
需要实现一个字符串对比工具，使用Monaco Editor的Diff功能，允许用户对比两份字符串的内容，并在home页面添加相应的工具卡片。

## 技术方案
1. **使用Monaco Editor的Diff模式**：利用现有的monaco-editor和monaco-editor-vue3依赖，实现Diff功能
2. **遵循现有工具的实现模式**：保持与ToJson.vue等工具一致的UI风格和交互方式
3. **左右分栏布局**：支持拖拽调整宽度，提供良好的用户体验

## 实现步骤

### 1. 创建ToDiff.vue页面组件
- 创建新文件 `src/pages/ToDiff.vue`
- 使用PageContainer和PageHeader组件保持一致的UI风格
- 实现左右分栏布局，支持拖拽调整宽度
- 集成Monaco Editor的Diff模式
- 添加基本交互功能（复制、清空等）

### 2. 添加路由配置
- 修改 `src/router/index.ts`
- 添加新路由 `/2diff`，指向ToDiff.vue组件

### 3. 更新Home.vue页面
- 修改 `src/pages/Home.vue`
- 添加To Diff工具卡片，包含图标、名称、描述和说明
- 链接到 `/2diff` 路径

### 4. 实现Diff功能
- 使用monaco-editor-vue3的Diff Editor模式
- 支持实时对比两份输入的字符串
- 提供清晰的差异高亮显示
- 支持常见的编辑功能（撤销/重做等）

## 预期效果
- 在home页面显示To Diff工具卡片
- 点击卡片进入Diff对比页面
- 页面分为左右两栏，可拖拽调整宽度
- 左侧输入原始字符串，右侧输入对比字符串
- 实时显示差异，高亮显示修改、添加和删除的内容
- 支持复制对比结果
- 支持清空输入

## 技术要点
- Monaco Editor Diff模式的正确配置和使用
- 左右分栏布局的实现和拖拽功能
- 保持与现有工具一致的UI风格和交互方式
- 实时对比功能的实现

## 依赖检查
- 已安装monaco-editor和monaco-editor-vue3，无需额外安装依赖
- 已配置vite-plugin-monaco-editor开发依赖，可直接使用

## 实现时间
预计1-2小时即可完成全部实现和测试。