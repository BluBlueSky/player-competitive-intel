<template>
  <div class="p-6 lg:p-10 max-w-6xl mx-auto">
    <div v-if="report">
      <!-- Header -->
      <header class="mb-10">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">竞品周报</span>
          <span class="text-xs text-slate-400">{{ report.date }}</span>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">{{ report.title }}</h1>
      </header>

      <!-- Core Insights -->
      <CoreInsights :insights="report.coreInsights || []" />

      <!-- Competitor Updates -->
      <section class="mb-10">
        <div class="flex items-center gap-2 mb-5">
          <h2 class="section-title">
            <span class="w-1 h-5 bg-violet-500 rounded-full"></span>
            竞品动态
          </h2>
        </div>
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <CompetitorCard
            v-for="comp in report.competitorUpdates || []"
            :key="comp.name"
            :competitor="comp"
          />
        </div>
      </section>

      <!-- App Store Reviews -->
      <section v-if="report.appStoreReviews" class="mb-10">
        <div class="flex items-center gap-2 mb-5">
          <h2 class="section-title">
            <span class="w-1 h-5 bg-amber-500 rounded-full"></span>
            应用商店声音
          </h2>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Pain Points -->
          <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div class="px-5 py-3.5 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
              <h3 class="font-semibold text-red-800 text-sm flex items-center gap-2">
                🔴 用户痛点（低星差评）
              </h3>
            </div>
            <div class="divide-y divide-slate-100">
              <div
                v-for="(point, i) in report.appStoreReviews.painPoints"
                :key="i"
                class="px-5 py-4 hover:bg-red-50/30 transition-colors"
              >
                <p class="text-sm font-medium text-slate-800">{{ point.title }}</p>
                <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">{{ point.detail }}</p>
                <div class="flex items-center justify-between mt-2">
                  <div class="flex items-center gap-2">
                    <span class="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-500">{{ point.app }}</span>
                    <span class="text-[11px] text-slate-400">{{ point.platform }}</span>
                  </div>
                  <a
                    v-if="point.sourceUrl"
                    :href="point.sourceUrl"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center gap-0.5 text-[11px] text-indigo-500 hover:text-indigo-700 transition-colors"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    原文
                  </a>
                </div>
              </div>
            </div>
          </div>
          <!-- Highlights -->
          <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div class="px-5 py-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
              <h3 class="font-semibold text-emerald-800 text-sm flex items-center gap-2">
                🟢 用户好评亮点
              </h3>
            </div>
            <div class="divide-y divide-slate-100">
              <div
                v-for="(hl, i) in report.appStoreReviews.highlights"
                :key="i"
                class="px-5 py-4 hover:bg-emerald-50/30 transition-colors"
              >
                <p class="text-sm font-medium text-slate-800">{{ hl.title }}</p>
                <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">{{ hl.detail }}</p>
                <div class="flex items-center justify-between mt-2">
                  <div class="flex items-center gap-2">
                    <span class="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-500">{{ hl.app }}</span>
                    <span class="text-[11px] text-slate-400">{{ hl.platform }}</span>
                  </div>
                  <a
                    v-if="hl.sourceUrl"
                    :href="hl.sourceUrl"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center gap-0.5 text-[11px] text-indigo-500 hover:text-indigo-700 transition-colors"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    原文
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Hiring Signals -->
      <section v-if="report.hiringSignals && report.hiringSignals.length > 0" class="mb-10">
        <div class="flex items-center gap-2 mb-5">
          <h2 class="section-title">
            <span class="w-1 h-5 bg-teal-500 rounded-full"></span>
            招聘信号解读
          </h2>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-100">
                <th class="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">公司</th>
                <th class="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">职位</th>
                <th class="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">技术关键词</th>
                <th class="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">方向解读</th>
                <th class="px-5 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider w-16">溯源</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(signal, i) in report.hiringSignals" :key="i" class="hover:bg-slate-50/50 transition-colors">
                <td class="px-5 py-4 font-semibold text-slate-800">{{ signal.company }}</td>
                <td class="px-5 py-4 text-slate-600">{{ signal.position }}</td>
                <td class="px-5 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="kw in signal.keywords"
                      :key="kw"
                      class="inline-block px-2 py-0.5 text-[11px] bg-indigo-50 text-indigo-700 rounded-md font-medium"
                    >{{ kw }}</span>
                  </div>
                </td>
                <td class="px-5 py-4 text-slate-600 text-[13px] leading-relaxed max-w-xs">{{ signal.interpretation }}</td>
                <td class="px-5 py-4">
                  <a
                    v-if="signal.sourceUrl"
                    :href="signal.sourceUrl"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-indigo-50 text-indigo-500 hover:text-indigo-700 transition-colors"
                    title="查看原始招聘信息"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- App Metrics -->
      <section v-if="report.appMetrics && report.appMetrics.length > 0" class="mb-10">
        <div class="flex items-center gap-2 mb-5">
          <h2 class="section-title">
            <span class="w-1 h-5 bg-cyan-500 rounded-full"></span>
            应用数据概览
          </h2>
          <span class="text-xs text-slate-400 ml-2">公开数据（评分 / 下载量 / 开源活跃度）</span>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-100">
                <th class="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">应用</th>
                <th class="px-4 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">iOS 评分</th>
                <th class="px-4 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Android 下载</th>
                <th class="px-4 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Android 评分</th>
                <th class="px-4 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">GitHub Stars</th>
                <th class="px-4 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">周提交</th>
                <th class="px-4 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider w-12">链接</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(app, i) in report.appMetrics" :key="i" class="hover:bg-slate-50/50 transition-colors">
                <td class="px-4 py-3.5 font-semibold text-slate-800">{{ app.name }}</td>
                <td class="px-4 py-3.5 text-center">
                  <span v-if="app.iosRating" class="inline-flex items-center gap-1">
                    <span class="text-amber-500 text-xs">★</span>
                    <span class="font-medium text-slate-700">{{ app.iosRating }}</span>
                    <span class="text-[11px] text-slate-400">({{ app.iosRatingCount }})</span>
                  </span>
                  <span v-else class="text-slate-300">-</span>
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span v-if="app.androidDownloads" class="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {{ app.androidDownloads }}
                  </span>
                  <span v-else class="text-slate-300">-</span>
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span v-if="app.androidRating" class="inline-flex items-center gap-1">
                    <span class="text-amber-500 text-xs">★</span>
                    <span class="font-medium text-slate-700">{{ app.androidRating }}</span>
                  </span>
                  <span v-else class="text-slate-300">-</span>
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span v-if="app.githubStars" class="font-medium text-slate-700">
                    {{ formatStars(app.githubStars) }}
                  </span>
                  <span v-else class="text-slate-300">-</span>
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span v-if="app.weeklyCommits" class="text-xs font-medium px-2 py-0.5 rounded-full"
                    :class="app.weeklyCommits > 20 ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'">
                    {{ app.weeklyCommits }} commits
                  </span>
                  <span v-else class="text-slate-300">-</span>
                </td>
                <td class="px-4 py-3.5 text-center">
                  <a
                    v-if="app.sourceUrl"
                    :href="app.sourceUrl"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-indigo-50 text-indigo-500 hover:text-indigo-700 transition-colors"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
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
import CoreInsights from '../components/CoreInsights.vue'
import CompetitorCard from '../components/CompetitorCard.vue'

const props = defineProps<{ report?: any }>()
const route = useRoute()
const report = ref<any>(props.report || null)

function formatStars(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

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
