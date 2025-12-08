# 全局Footer实现计划

## 实现目标
在App.vue中添加全局footer，平时隐藏，鼠标移动到页面底部时向上弹出，展示网站信息（如"粤ICP备2020138557号-5"）。

## 实现步骤

1. **修改App.vue文件**
   - 在`<router-view />`下方添加footer元素
   - 使用Tailwind CSS进行样式设计
   - 实现footer的初始隐藏状态

2. **添加交互逻辑**
   - 使用Vue 3的组合式API（setup script）
   - 添加鼠标移动事件监听器
   - 检测鼠标位置，当接近页面底部时显示footer
   - 当鼠标离开底部区域时隐藏footer

3. **设计footer样式**
   - 使用固定定位（fixed）将footer定位在视口底部
   - 初始状态下，footer的底部位置设为负的自身高度，使其完全隐藏
   - 当鼠标移动到底部区域时，通过修改transform属性将footer向上移动显示
   - 添加平滑过渡效果

4. **添加网站信息**
   - 在footer中添加ICP备案信息
   - 可以考虑添加其他网站信息，如版权声明等

## 技术要点

- 使用Vue 3的`onMounted`和`onUnmounted`生命周期钩子管理事件监听器
- 使用`clientY`属性获取鼠标垂直位置
- 使用`window.innerHeight`获取视口高度
- 使用CSS `transition`实现平滑动画效果
- 使用Tailwind CSS进行样式设计，保持与现有项目风格一致

## 预期效果

- 平时footer完全隐藏在页面底部
- 当鼠标移动到页面底部约50px范围内时，footer平滑向上弹出
- 当鼠标离开底部区域时，footer平滑向下隐藏
- footer展示网站的ICP备案信息

## 文件修改

- 仅修改`/Users/baby/Documents/IdeaProjects/toolhub/src/App.vue`一个文件
- 不需要创建新组件或文件
- 保持现有代码结构不变，仅添加footer相关代码