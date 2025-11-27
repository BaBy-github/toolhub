<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

// 定义转换工具类型
interface ConversionTool {
  name: string
  label: string
  path: string
  icon: string
  color: string
}

// 定义组件属性
const props = defineProps<{
  currentTool: string
  conversions: ConversionTool[]
}>()

// 定义组件事件
const emit = defineEmits(['conversion']) 

const router = useRouter()

// 组件状态
const isOpen = ref(false)
const lastConversion = ref<ConversionTool | null>(null)

// 从localStorage加载上次转换选择
function loadLastConversion() {
  const key = `last_conversion_${props.currentTool}`
  const saved = localStorage.getItem(key)
  if (saved) {
    const parsed = JSON.parse(saved)
    // 检查保存的转换是否仍在可用列表中
    const conversion = props.conversions.find(c => c.name === parsed.name)
    if (conversion) {
      lastConversion.value = conversion
    }
  }
  // 如果没有保存的转换或保存的转换不可用，使用第一个转换
  if (!lastConversion.value && props.conversions.length > 0) {
    lastConversion.value = props.conversions[0] || null
  }
}

// 保存转换选择到localStorage
function saveConversion(conversion: ConversionTool) {
  const key = `last_conversion_${props.currentTool}`
  localStorage.setItem(key, JSON.stringify(conversion))
  lastConversion.value = conversion
}

// 处理转换点击事件
function handleConversion(conversion: ConversionTool) {
  saveConversion(conversion)
  emit('conversion', conversion)
}

// 计算当前显示的转换工具
const displayConversion = computed(() => {
  return lastConversion.value || props.conversions[0] || null
})

// 计算过滤后的转换选项（排除默认显示的选项）
const filteredConversions = computed(() => {
  if (!displayConversion.value) {
    return props.conversions
  }
  return props.conversions.filter(conversion => conversion.name !== displayConversion.value!.name)
})

// 组件挂载时加载上次转换选择
onMounted(() => {
  loadLastConversion()
})
</script>

<template>
  <div class="relative group">
    <!-- 主转换按钮 -->
    <button
      v-if="displayConversion"
      class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform"
      @click="handleConversion(displayConversion)"
    >
      <div 
        class="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-white"
        :style="{ color: displayConversion.color }"
      >
        {{ displayConversion.icon }}
      </div>
      <span class="text-sm font-medium">{{ displayConversion.label }}</span>
      <svg class="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>
    
    <!-- 下拉菜单 -->
    <div 
      class="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-1000"
    >
      <div 
        v-for="item in filteredConversions" 
        :key="item.name"
        class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
        @click="handleConversion(item)"
      >
        <div 
          class="flex h-8 w-8 items-center justify-center rounded-lg"
          :style="{ backgroundColor: `${item.color}10`, color: item.color }"
        >
          {{ item.icon }}
        </div>
        <span class="text-sm font-medium">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 添加一些额外的动画效果 */
.group:hover .absolute {
  animation: slideDown 0.3s ease-out forwards;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 按钮点击效果 */
button:active {
  transform: scale(0.98);
}

/* 下拉菜单项悬停效果 */
div:hover {
  transition: all 0.2s ease;
}

/* 为group添加伪元素，确保鼠标从按钮到菜单的移动路径始终在hover区域内 */
.group::before {
  content: '';
  position: absolute;
  right: 0;
  top: 100%;
  width: 100%;
  height: 10px;
  /* 这个伪元素作为过渡区域，确保鼠标移动时不会离开group的hover范围 */
}
</style>
