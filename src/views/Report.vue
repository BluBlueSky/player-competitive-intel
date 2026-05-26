<template>
  <div class="p-6 lg:p-10 max-w-6xl mx-auto">
    <div v-if="report">
      <!-- Header -->
      <header class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">竞品周报</span>
          <span class="text-xs text-slate-400">{{ report.date }}</span>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">{{ report.title }}</h1>
      </header>

      <!-- 1. Executive Summary -->
      <ExecutiveSummary
        :summary="report.executiveSummary || ''"
        :data-quality="report.dataQuality"
      />

      <!-- 2. Action Items -->
      <ActionItems :items="report.actionItems || []" />

      <!-- 3. Competitive Moves -->
      <CompetitiveMoves
        :moves="report.competitiveLandscape?.thisWeekMoves"
        :feature-gaps="report.competitiveLandscape?.featureGapAlert"
      />

      <!-- 4. User Voice -->
      <UserVoice
        :unmet-needs="report.userVoice?.unmetNeeds"
        :satisfaction-shifts="report.userVoice?.satisfactionShifts"
      />

      <!-- 5. Tech Trends -->
      <TechTrends :trends="report.techTrends || []" />

      <!-- 6. Week Over Week -->
      <WeekOverWeek
        v-if="report.weekOverWeek"
        :data="report.weekOverWeek"
      />

      <!-- 7. Data Quality -->
      <DataQuality
        v-if="report.dataQuality"
        :data="report.dataQuality"
      />
    </div>

    <!-- Loading -->
    <div v-else class="flex items-center justify-center h-96">
      <div class="text-center">
        <div class="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-sm text-slate-400">加载报告中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ExecutiveSummary from '../components/ExecutiveSummary.vue'
import ActionItems from '../components/ActionItems.vue'
import CompetitiveMoves from '../components/CompetitiveMoves.vue'
import UserVoice from '../components/UserVoice.vue'
import TechTrends from '../components/TechTrends.vue'
import WeekOverWeek from '../components/WeekOverWeek.vue'
import DataQuality from '../components/DataQuality.vue'

const props = defineProps<{ report?: any }>()
const route = useRoute()
const report = ref<any>(props.report || null)

async function loadReport(date: string) {
  try {
    const data = await import(`../../reports/${date}.json`)
    report.value = data.default || data
  } catch {
    report.value = null
  }
}

onMounted(() => {
  if (!props.report && route.params.date) {
    loadReport(route.params.date as string)
  }
})

watch(() => route.params.date, (newDate) => {
  if (newDate && !props.report) {
    loadReport(newDate as string)
  }
})

watch(() => props.report, (newReport) => {
  if (newReport) report.value = newReport
})
</script>
