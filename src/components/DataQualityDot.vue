<template>
  <span
    class="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
    :class="dotClass"
    :title="tooltip"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="colorClass"></span>
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ level: string }>()

const dotClass = computed(() => {
  switch (props.level) {
    case 'high': return 'bg-emerald-500/20 text-emerald-300'
    case 'medium': return 'bg-amber-500/20 text-amber-300'
    case 'low': return 'bg-red-500/20 text-red-300'
    default: return 'bg-slate-500/20 text-slate-300'
  }
})

const colorClass = computed(() => {
  switch (props.level) {
    case 'high': return 'bg-emerald-400'
    case 'medium': return 'bg-amber-400'
    case 'low': return 'bg-red-400'
    default: return 'bg-slate-400'
  }
})

const label = computed(() => {
  switch (props.level) {
    case 'high': return '数据充分'
    case 'medium': return '数据一般'
    case 'low': return '数据有限'
    default: return '未知'
  }
})

const tooltip = computed(() => {
  switch (props.level) {
    case 'high': return '本期多数数据源正常采集，分析结论可信度高'
    case 'medium': return '部分数据源采集不完整，结论仅供参考'
    case 'low': return '本期数据较少，建议结合其他信息源判断'
    default: return ''
  }
})
</script>
