<template>
  <div
    class="bg-white rounded-xl border p-5 hover:shadow-md transition-all"
    :class="borderClass"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-slate-900 leading-snug">{{ item.action }}</p>
        <p class="text-xs text-slate-500 mt-2 leading-relaxed">{{ item.reason }}</p>

        <div class="flex flex-wrap items-center gap-2 mt-3">
          <span v-if="item.owner" class="text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
            {{ item.owner }}
          </span>
          <span v-if="item.deadline" class="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {{ item.deadline }}
          </span>
          <span
            class="text-[11px] px-2 py-0.5 rounded font-medium"
            :class="confidenceClass"
          >
            置信度: {{ confidenceLabel }}
          </span>
        </div>

        <!-- Source Reference -->
        <p v-if="item.sourceRef" class="text-[11px] text-slate-400 mt-2 italic">
          数据依据: {{ item.sourceRef }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  item: {
    action: string
    reason: string
    deadline?: string
    owner?: string
    confidence: string
    sourceRef: string
  }
  priority: string
}>()

const borderClass = computed(() => {
  switch (props.priority) {
    case 'P0': return 'border-red-200 bg-red-50/30'
    case 'P1': return 'border-amber-200 bg-amber-50/20'
    default: return 'border-slate-200'
  }
})

const confidenceClass = computed(() => {
  switch (props.item.confidence) {
    case 'high': return 'bg-emerald-50 text-emerald-700'
    case 'medium': return 'bg-amber-50 text-amber-700'
    case 'low': return 'bg-red-50 text-red-700'
    default: return 'bg-slate-100 text-slate-600'
  }
})

const confidenceLabel = computed(() => {
  switch (props.item.confidence) {
    case 'high': return '高'
    case 'medium': return '中'
    case 'low': return '低'
    default: return '未知'
  }
})
</script>
