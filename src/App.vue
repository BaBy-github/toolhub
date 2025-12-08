<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isFooterVisible = ref(false)

const handleMouseMove = (e: MouseEvent) => {
  // 当鼠标移动到页面底部50px范围内时显示footer
  if (e.clientY > window.innerHeight - 50) {
    isFooterVisible.value = true
  } else {
    isFooterVisible.value = false
  }
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <router-view />
  <footer 
    class="fixed bottom-0 left-0 right-0 bg-gray-800 text-white text-center py-3 px-4 text-sm transform transition-transform duration-300 ease-in-out" 
    :class="isFooterVisible ? 'translate-y-0' : '-translate-y-full'"
  >
    <p>粤ICP备2020138557号-5</p>
  </footer>
</template>

<style scoped>
/* 确保footer不会被其他元素遮挡 */
footer {
  z-index: 1000;
}
</style>
