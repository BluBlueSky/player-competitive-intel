<template>
  <section class="mb-10">
    <div class="flex items-center gap-2 mb-5">
      <h2 class="section-title">
        <span class="w-1 h-5 bg-indigo-500 rounded-full"></span>
        核心洞察
      </h2>
      <span class="text-xs text-slate-400 ml-2">本期最值得关注的动态</span>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="(insight, index) in insights"
        :key="index"
        class="insight-card"
        :class="cardClass(insight.type)"
      >
        <div class="flex items-start justify-between mb-3">
          <span class="data-badge" :class="badgeClass(insight.type)">
            {{ icon(insight.type) }} {{ typeLabel(insight.type) }}
          </span>
          <span class="text-xs text-slate-300">#{{ index + 1 }}</span>
        </div>
        <h3 class="font-semibold text-slate-800 text-[15px] leading-snug mb-2">{{ insight.title }}</h3>
        <p class="text-sm text-slate-600 leading-relaxed">{{ insight.content }}</p>

        <!-- Images -->
        <div v-if="insight.images && insight.images.length > 0" class="mt-3 space-y-2">
          <div v-for="(img, i) in insight.images" :key="i" class="rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
            <img :src="img.url" :alt="img.caption" class="w-full h-36 object-cover" @error="onImageError" />
            <p v-if="img.caption" class="text-[11px] text-slate-500 px-2 py-1.5 bg-white border-t border-slate-100">{{ img.caption }}</p>
          </div>
        </div>

        <!-- Source Link -->
        <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span class="text-xs text-slate-400">📍 {{ insight.source }}</span>
          <a
            v-if="insight.sourceUrl"
            :href="insight.sourceUrl"
            target="_blank"
            rel="noopener"
            class="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-0.5 transition-colors"
          >
            查看原文
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface InsightImage {
  url: string
  caption?: string
}

interface Insight {
  type: 'warning' | 'opportunity' | 'trend'
  title: string
  content: string
  source: string
  sourceUrl?: string
  images?: InsightImage[]
}

defineProps<{ insights: Insight[] }>()

function onImageError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

function icon(type: string) {
  const map: Record<string, string> = { warning: '⚠️', opportunity: '💡', trend: '📈' }
  return map[type] || '📌'
}

function typeLabel(type: string) {
  const map: Record<string, string> = { warning: '风险预警', opportunity: '机会点', trend: '趋势洞察' }
  return map[type] || '洞察'
}

function cardClass(type: string) {
  const map: Record<string, string> = {
    warning: 'border-red-200 bg-gradient-to-br from-white to-red-50/50',
    opportunity: 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50',
    trend: 'border-blue-200 bg-gradient-to-br from-white to-blue-50/50'
  }
  return map[type] || 'border-slate-200 bg-white'
}

function badgeClass(type: string) {
  const map: Record<string, string> = {
    warning: 'bg-red-100 text-red-700',
    opportunity: 'bg-emerald-100 text-emerald-700',
    trend: 'bg-blue-100 text-blue-700'
  }
  return map[type] || 'bg-slate-100 text-slate-700'
}
</script>
