### 问题分析
ToDiff页面无法打开的原因是在模板中使用了`<SkeletonLoader />`组件，但在script部分没有导入该组件，导致Vue无法识别这个未注册的组件。

### 修复方案
1. **修改文件**：`/src/pages/ToDiff.vue`
2. **添加导入语句**：在script部分的导入列表中添加SkeletonLoader组件的导入
3. **导入位置**：添加在现有导入语句的后面

### 具体代码修改
```typescript
// 在现有导入语句中添加
import SkeletonLoader from '@/components/SkeletonLoader.vue'
```

### 预期效果
修复后，ToDiff页面将能够正常加载，显示骨架屏加载状态，然后渲染差异编辑器内容。