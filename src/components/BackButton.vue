<script setup lang="ts">
import { RiArrowLeftLine } from '@remixicon/vue'
const emit = defineEmits(['click'])
</script>

<template>
  <button class="btn h-9 w-9 justify-center" @click="emit('click')">
    <RiArrowLeftLine size="22px" />
  </button>
</template>

<style scoped></style>
