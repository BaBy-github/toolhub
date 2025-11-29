# 集成i18next-vue实现国际化

## 1. 安装依赖
- 安装i18next、i18next-vue和i18next-browser-languagedetector

## 2. 创建国际化配置文件
- 创建`src/i18n`目录
- 创建`src/i18n/index.ts`用于初始化i18next
- 创建`src/i18n/locales`目录用于存放语言文件
- 创建`src/i18n/locales/zh.json`中文语言文件
- 创建`src/i18n/locales/en.json`英文语言文件

## 3. 初始化i18next
- 在`main.ts`中导入并配置i18next
- 将i18next挂载到Vue应用

## 4. 国际化所有文本内容
- 修改`Home.vue`中的文本为i18n键
- 修改`ToDiff.vue`中的文本为i18n键
- 修改其他页面（ToBase64.vue, ToEscape.vue, ToJson.vue, ToXml.vue）中的文本为i18n键
- 修改组件（PageContainer.vue, PageHeader.vue等）中的文本为i18n键

## 5. 添加语言切换功能
- 在`Home.vue`中添加中英文切换按钮
- 实现语言切换逻辑

## 6. 测试国际化效果
- 确保所有文本都能正确切换语言
- 确保语言切换按钮正常工作