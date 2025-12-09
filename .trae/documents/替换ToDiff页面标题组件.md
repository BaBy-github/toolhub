# 替换ToDiff页面标题组件

## 现状分析
- 当前ToDiff页面使用`PageHeader`组件显示标题
- `PageHeader`组件结构简单：返回按钮 + 标题文本 + 操作插槽
- 需要替换为Tailwind CSS UI Blocks中的现代页面标题组件

## 实现计划

1. **设计新的PageHeader组件**
   - 替换现有的`PageHeader`组件实现
   - 采用Tailwind CSS UI Blocks的现代设计风格
   - 保持原有的组件接口（props和events）以确保兼容性

2. **实现新的标题样式**
   - 参考Tailwind CSS UI Blocks的Page Headings组件设计
   - 添加更丰富的视觉效果和布局
   - 确保响应式设计

3. **更新ToDiff页面**
   - 确保ToDiff页面正确使用新的标题组件
   - 保持现有功能不变

4. **测试和优化**
   - 确保新组件在不同设备上正常显示
   - 验证功能完整性
   - 优化样式和性能

## 预期效果
- 更现代、更吸引人的页面标题
- 保持现有功能不变
- 提升用户体验

## 文件修改
- `src/components/PageHeader.vue` - 更新组件实现
- 可能需要调整`src/pages/ToDiff.vue`中的使用方式

## 技术要点
- 使用Tailwind CSS实现现代UI设计
- 保持组件的向后兼容性
- 响应式设计确保在各种设备上正常显示