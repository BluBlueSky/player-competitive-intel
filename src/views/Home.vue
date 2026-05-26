<template>
  <div v-if="latestReport">
    <Report :report="latestReport" />
  </div>
  <div v-else class="flex items-center justify-center h-full">
    <div class="text-center py-20">
      <div class="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-slate-700 mb-1">暂无竞品报告</h2>
      <p class="text-sm text-slate-400">每周五 18:00 自动采集并生成新一期报告</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Report from './Report.vue'

const latestReport = ref<any>(null)

onMounted(async () => {
  try {
    const manifest = await import('../../reports/manifest.json')
    const list = manifest.default || manifest
    if (list.length > 0) {
      const latest = list[0]
      const report = await import(`../../reports/${latest.date}.json`)
      latestReport.value = report.default || report
    }
  } catch {
    latestReport.value = null
  }
})
</script>
