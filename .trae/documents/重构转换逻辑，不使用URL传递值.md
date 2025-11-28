## 重构计划

### 问题分析
1. **当前问题**：从ToJson点击ToDiff后，上一个工具的结果没有输入到内容A
2. **原因**：
   - `goToDiff`函数使用URL query参数传递`original`值
   - 但ConversionButton的@conversion事件处理函数使用URL query参数传递`input`值
   - ToDiff页面只检查`original`参数，不检查`input`参数
3. **用户要求**：不使用URL传递值，考虑其他方案

### 解决方案
1. **扩展toolState工具**：增强现有的toolState工具，支持更灵活的状态传递
2. **统一转换逻辑**：使用toolState来传递转换值，而不是URL query参数
3. **修改组件初始化逻辑**：从toolState获取初始值，而不是URL query参数

### 实现步骤

#### 1. 扩展toolState工具
- 修改`src/utils/toolState.ts`，添加`setNextToolInput`和`getNextToolInput`函数
- 实现一个临时存储，用于在工具间传递值

#### 2. 修改转换逻辑
- 修改`ToJson.vue`中的`goToDiff`函数，使用toolState传递值
- 修改`ToJson.vue`中的@conversion事件处理函数，使用toolState传递值
- 修改`ToXml.vue`中的@conversion事件处理函数，使用toolState传递值

#### 3. 修改ToDiff.vue初始化逻辑
- 从toolState获取初始值，而不是URL query参数
- 支持从`original`和`input`两种参数名获取值

#### 4. 修改其他工具页面
- 确保所有工具页面都能从toolState获取初始值

### 预期效果
- 从ToJson点击ToDiff后，上一个工具的结果能正确输入到内容A
- 不使用URL传递值，避免URL过长和安全问题
- 统一转换逻辑，提高代码可维护性

### 技术方案
- 使用现有的toolState工具作为状态传递机制
- 扩展toolState，添加临时存储功能
- 修改组件初始化逻辑，优先从toolState获取值

### 实现细节
1. **toolState扩展**：
   - 添加`nextToolInput`临时存储
   - 添加`setNextToolInput`函数，用于设置下一个工具的输入值
   - 添加`getNextToolInput`函数，用于获取下一个工具的输入值
   - 添加`clearNextToolInput`函数，用于清除临时存储

2. **转换逻辑修改**：
   - 在转换前调用`setNextToolInput`设置下一个工具的输入值
   - 移除URL query参数传递

3. **组件初始化修改**：
   - 在组件挂载时调用`getNextToolInput`获取输入值
   - 清除临时存储
   - 保留URL query参数支持，作为备选方案

### 测试计划
1. 从ToJson点击ToDiff，验证内容A能正确显示上一个工具的结果
2. 从ToJson点击ToXml，验证ToXml页面能正确获取输入值
3. 从ToXml点击ToJson，验证ToJson页面能正确获取输入值
4. 测试所有转换路径，确保值能正确传递

### 优势
- 不使用URL传递值，避免URL过长和安全问题
- 统一转换逻辑，提高代码可维护性
- 支持更复杂的数据传递
- 保持向后兼容，不破坏现有功能