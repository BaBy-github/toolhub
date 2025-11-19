<script setup lang="ts">
import { ref, defineComponent, h, computed } from 'vue'
const p = defineProps<{ value: any }>()
const open = ref<Record<string, boolean>>({})
function isObj(v: any) { return v && typeof v === 'object' && !Array.isArray(v) }
function isArr(v: any) { return Array.isArray(v) }
function typeOf(v: any) { return isArr(v) ? 'array' : isObj(v) ? 'object' : typeof v }
function toggle(path: string) { open.value[path] = !open.value[path] }
function entries(v: any) { return isObj(v) ? Object.entries(v) : isArr(v) ? v.map((x, i) => [String(i), x]) : [] }
const TreeNode: any = defineComponent({
  name: 'TreeNode',
  props: { v: { type: null }, path: { type: String, required: true } },
  setup(props: any) {
    const opened = computed(() => !!open.value[props.path])
    const t = computed(() => typeOf(props.v))
    const clickable = computed(() => t.value === 'object' || t.value === 'array')
    const head: any = () =>
      h('div', { class: 'flex items-center gap-2' }, [
        clickable.value ? h('button', { class: 'btn-ghost px-2 py-1', onClick: () => toggle(props.path) }, opened.value ? '−' : '+') : null,
        h('span', { class: 'text-gray-700' }, t.value === 'object' ? '{}' : t.value === 'array' ? '[]' : String(props.v)),
        h('span', { class: 'text-xs text-gray-400' }, t.value),
      ])
    const body: any = () =>
      opened.value
        ? h(
            'div',
            { class: 'ml-4 border-l pl-3 flex flex-col gap-1' },
            entries(props.v).map(([k, val]: any) =>
              h('div', { class: 'flex flex-col gap-1' }, [
                h('div', { class: 'flex items-center gap-2' }, [h('span', { class: 'text-blue-600 text-xs' }, k + ':')]),
                h(TreeNode as any, { v: val, path: props.path + '.' + k }),
              ]),
            ),
          )
        : null
    return (): any => h('div', { class: 'py-1' }, [head(), body()])
  },
})
</script>

<template>
  <div class="text-sm">
    <component :is="TreeNode" :v="p.value" path="root" />
  </div>
</template>

<style scoped></style>