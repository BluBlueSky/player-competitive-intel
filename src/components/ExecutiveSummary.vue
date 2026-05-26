<template>
  <div class="mb-8">
    <!-- Executive Summary Banner -->
    <div class="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
      <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div class="relative">
        <div class="flex items-center gap-3 mb-3">
          <span class="text-xs font-semibold text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-full">本周要点</span>
          <DataQualityDot :level="dataQuality?.overallConfidence || 'medium'" />
        </div>
        <p class="text-lg font-medium leading-relaxed text-slate-100">
          {{ summary || '本周暂无重大竞品动态。' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DataQualityDot from './DataQualityDot.vue'

defineProps<{
  summary: string
  dataQuality?: {
    overallConfidence: string
    caveat: string
  }
}>()
</script>
