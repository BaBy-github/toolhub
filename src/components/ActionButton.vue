<script setup lang="ts">
const p = defineProps<{ variant?: 'default' | 'primary' | 'ghost'; size?: 'sm' | 'md' | 'lg'; title?: string; disabled?: boolean; iconOnly?: boolean }>()
const emit = defineEmits(['click'])
function onClick(e: MouseEvent) { if (!p.disabled) emit('click', e) }
const v = p.variant || 'default'
const s = p.size || 'md'
const base = 'inline-flex items-center justify-center transition focus:outline-none'
const sizes: Record<string, string> = { 
  sm: p.iconOnly ? 'h-8 w-8 rounded-xl text-sm' : 'h-8 px-3 rounded-xl text-sm', 
  md: p.iconOnly ? 'h-9 w-9 rounded-2xl text-base' : 'h-9 px-4 rounded-2xl text-base', 
  lg: p.iconOnly ? 'h-10 w-10 rounded-2xl text-lg' : 'h-10 px-5 rounded-2xl text-lg' 
}
const variants: Record<string, string> = { 
  default: 'bg-gray-100 text-gray-700 hover:bg-gray-200', 
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
}
</script>

<template>
  <button :class="[base, sizes[s], variants[v], 'gap-2', p.disabled ? 'opacity-60 cursor-not-allowed' : '']" :title="p.title" @click="onClick">
    <slot></slot>
  </button>
</template>

<style scoped></style>
