<template>
  <section v-if="trends && trends.length > 0" class="mb-10">
    <div class="flex items-center gap-2 mb-5">
      <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
        <span class="w-1 h-5 bg-teal-500 rounded-full"></span>
        技术趋势
      </h2>
      <span class="text-xs text-slate-400 ml-2">来自开源社区与技术讨论</span>
    </div>

    <div class="space-y-3">
      <div
        v-for="(trend, i) in trends"
        :key="i"
        class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow"
      >
        <div class="flex items-start gap-3">
          <span
            class="flex-shrink-0 mt-1 text-[10px] font-bold px-2 py-0.5 rounded"
            :class="timeframeClass(trend.timeframe)"
          >{{ timeframeLabel(trend.timeframe) }}</span>
          <div class="flex-1">
            <p class="text-sm font-medium text-slate-800">{{ trend.trend }}</p>
            <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">{{ trend.evidence }}</p>
            <p v-if="trend.implication" class="text-xs text-teal-700 mt-2 font-medium">
              影响: {{ trend.implication }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  trends: Array<{
    trend: string
    evidence: string
    implication?: string
    timeframe: string
  }>
}>()

function timeframeClass(tf: string) {
  switch (tf) {
    case 'short_term': return 'bg-red-100 text-red-700'
    case 'mid_term': return 'bg-amber-100 text-amber-700'
    case 'long_term': return 'bg-teal-100 text-teal-700'
    default: return 'bg-slate-100 text-slate-600'
  }
}

function timeframeLabel(tf: string) {
  switch (tf) {
    case 'short_term': return '短期'
    case 'mid_term': return '中期'
    case 'long_term': return '长期'
    default: return '观察'
  }
}
</script>
