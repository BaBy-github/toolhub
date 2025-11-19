<script setup lang="ts">
import { ref, watch } from 'vue'
const props = defineProps<{ value: any }>()
const stack = ref<{ label: string; items: { key: string; val: any }[] }[]>([])
function isObj(v: any) { return v && typeof v === 'object' && !Array.isArray(v) }
function isArr(v: any) { return Array.isArray(v) }
function toItems(v: any) {
  if (isObj(v)) return Object.keys(v).map((k) => ({ key: k, val: v[k] }))
  if (isArr(v)) return v.map((x, i) => ({ key: String(i), val: x }))
  return []
}
function push(v: any, label: string) {
  stack.value.push({ label, items: toItems(v) })
}
function reset() {
  stack.value = []
  push(props.value, 'root')
}
watch(() => props.value, () => reset(), { immediate: true })
function select(idx: number, colIdx: number) {
  stack.value = stack.value.slice(0, colIdx + 1)
  const col = stack.value[colIdx]
  if (!col) return
  const item = col.items[idx]
  if (!item) return
  const t = isObj(item.val) || isArr(item.val)
  if (t) push(item.val, item.key)
}
</script>

<template>
  <div class="flex h-full overflow-auto">
    <div v-for="(col, i) in stack" :key="i" class="min-w-[220px] border-r">
      <div class="toolbar">{{ col.label }}</div>
      <ul class="p-2">
        <li v-for="(it, idx) in col.items" :key="idx">
          <button class="w-full text-left btn-ghost px-2 py-1" @click="select(idx, i)">{{ it.key }}</button>
        </li>
      </ul>
    </div>
  </div>
  <div v-if="!stack.length" class="p-2 text-sm text-gray-500">无内容</div>
</template>

<style scoped></style>