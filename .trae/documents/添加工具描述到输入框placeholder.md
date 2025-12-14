# 添加工具描述到输入框placeholder

## 实现思路
1. 每个工具页面使用monaco-editor-vue3作为输入编辑器
2. monaco-editor支持通过options配置placeholder
3. 工具描述已经在i18n文件中定义，可通过translation key获取
4. 每个工具页面都需要修改编辑器配置

## 实现步骤
1. 为每个工具页面的编辑器options添加placeholder配置
2. 根据工具路由或ID获取对应的i18n描述key
3. 使用t()函数将描述转换为当前语言的文本
4. 将文本设置为编辑器的placeholder

## 具体修改

### 1. ToJson.vue
- 在编辑器options中添加placeholder: t('home.toJson.description')

### 2. ToBase64.vue
- 在编辑器options中添加placeholder: t('home.toBase64.description')

### 3. ToXml.vue
- 在编辑器options中添加placeholder: t('home.toXml.description')

### 4. ToDiff.vue
- 在编辑器options中添加placeholder: t('home.toDiff.description')

### 5. ToEscape.vue
- 在编辑器options中添加placeholder: t('home.toEscape.description')

### 6. ToCrypto.vue
- 在编辑器options中添加placeholder: t('home.toCrypto.description')

## 预期效果
- 每个工具页面的输入框会显示对应的工具描述作为placeholder
- 支持多语言切换
- 提升用户体验，明确每个工具的用途

## 技术要点
- 使用monaco-editor的placeholder配置
- 利用现有的i18n翻译机制
- 保持代码的一致性和可维护性