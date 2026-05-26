<template>
  <aside class="w-72 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm">
    <!-- Logo & Brand -->
    <div class="p-5 border-b border-slate-100">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
          </svg>
        </div>
        <div>
          <h1 class="text-base font-bold text-slate-900 tracking-tight">竞品观察</h1>
          <p class="text-xs text-slate-400">每周五自动更新</p>
        </div>
      </div>
    </div>

    <!-- Report List -->
    <nav class="flex-1 overflow-y-auto p-3">
      <p class="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">历史报告</p>
      <router-link
        v-for="report in reports"
        :key="report.date"
        :to="{ name: 'report', params: { date: report.date } }"
        class="sidebar-link"
        :class="{ active: isActive(report.date) }"
      >
        <div class="flex items-center justify-between">
          <span class="font-medium text-slate-700">{{ formatDate(report.date) }}</span>
          <span v-if="isLatest(report.date)" class="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">最新</span>
        </div>
        <div class="text-xs text-slate-400 mt-0.5">{{ report.title }}</div>
      </router-link>
      <div v-if="reports.length === 0" class="px-3 py-12 text-center">
        <div class="text-3xl mb-2">📊</div>
        <p class="text-sm text-slate-400">暂无报告</p>
      </div>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-slate-100">
      <div class="flex items-center gap-2 text-xs text-slate-400">
        <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        <span>数据源运行正常</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

interface ReportMeta {
  date: string
  title: string
}

const route = useRoute()
const reports = ref<ReportMeta[]>([])

function isActive(date: string) {
  return route.params.date === date
}

function isLatest(date: string) {
  return reports.value.length > 0 && reports.value[0].date === date
}

function formatDate(date: string) {
  const d = new Date(date)
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${month}月${day}日`
}

onMounted(async () => {
  try {
    const manifest = await import('../../reports/manifest.json')
    reports.value = manifest.default || manifest
  } catch {
    reports.value = []
  }
})
</script>
