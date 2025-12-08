<script setup lang="ts">
import BackButton from './BackButton.vue'
const p = defineProps<{ title: string }>()
const emit = defineEmits(['back'])
</script>

<template>
  <div class="mb-8 flex items-center justify-between">
    <BackButton @click="emit('back')" />
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{{ p.title }}</h1>
    <div class="flex gap-2">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<style scoped></style>
