<script setup lang="ts">
import BackButton from './BackButton.vue'
const p = defineProps<{ title: string }>()
const emit = defineEmits(['back'])
</script>

<template>
  <div class="mb-4 flex items-center justify-between">
    <BackButton @click="emit('back')" />
    <h1 class="text-xl font-semibold">{{ p.title }}</h1>
    <div class="flex gap-2">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<style scoped></style>
