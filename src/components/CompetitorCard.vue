<template>
  <div class="competitor-card">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
          {{ competitor.name.charAt(0) }}
        </div>
        <h3 class="font-bold text-slate-800">{{ competitor.name }}</h3>
      </div>
      <span class="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-medium">
        {{ competitor.platform }}
      </span>
    </div>
    <div class="space-y-3">
      <div
        v-for="(update, index) in competitor.updates"
        :key="index"
        class="p-3 rounded-lg bg-slate-50/80 hover:bg-slate-100/80 transition-colors"
      >
        <div class="flex gap-3">
          <div class="flex-shrink-0 mt-0.5">
            <span
              class="block w-2.5 h-2.5 rounded-full ring-2 ring-white"
              :class="impactDot(update.impact)"
            ></span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="data-badge" :class="typeBadge(update.type)">
                {{ typeLabel(update.type) }}
              </span>
              <span class="font-medium text-sm text-slate-800">{{ update.title }}</span>
            </div>
            <p class="text-[13px] text-slate-500 mt-1.5 leading-relaxed">{{ update.detail }}</p>
            <!-- Source with link -->
            <div class="flex items-center gap-2 mt-2">
              <span class="text-xs text-slate-400">{{ update.source }}</span>
              <a
                v-if="update.sourceUrl"
                :href="update.sourceUrl"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-0.5 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                溯源
              </a>
            </div>
          </div>
        </div>
        <!-- Images Gallery -->
        <div v-if="update.images && update.images.length > 0" class="mt-3 ml-5 grid gap-2" :class="update.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'">
          <div v-for="(img, i) in update.images" :key="i" class="rounded-lg overflow-hidden border border-slate-200 bg-white group cursor-pointer" @click="openImage(img.url)">
            <img :src="img.url" :alt="img.caption" class="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200" @error="onImageError" />
            <p v-if="img.caption" class="text-[11px] text-slate-500 px-2 py-1.5 border-t border-slate-100 truncate">{{ img.caption }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface UpdateImage {
  url: string
  caption?: string
}

interface Update {
  type: 'version' | 'feature' | 'strategy' | 'hiring'
  title: string
  detail: string
  source: string
  sourceUrl?: string
  impact: 'high' | 'medium' | 'low'
  images?: UpdateImage[]
}

interface Competitor {
  name: string
  platform: string
  updates: Update[]
}

defineProps<{ competitor: Competitor }>()

function onImageError(e: Event) {
  const el = e.target as HTMLImageElement
  el.parentElement!.style.display = 'none'
}

function openImage(url: string) {
  window.open(url, '_blank')
}

function impactDot(impact: string) {
  const map: Record<string, string> = {
    high: 'bg-red-500 shadow-red-200 shadow-sm',
    medium: 'bg-amber-400 shadow-amber-200 shadow-sm',
    low: 'bg-slate-300'
  }
  return map[impact] || 'bg-slate-300'
}

function typeBadge(type: string) {
  const map: Record<string, string> = {
    version: 'bg-violet-100 text-violet-700',
    feature: 'bg-sky-100 text-sky-700',
    strategy: 'bg-orange-100 text-orange-700',
    hiring: 'bg-teal-100 text-teal-700'
  }
  return map[type] || 'bg-slate-100 text-slate-700'
}

function typeLabel(type: string) {
  const map: Record<string, string> = {
    version: '版本更新',
    feature: '新功能',
    strategy: '战略动作',
    hiring: '人才招聘'
  }
  return map[type] || type
}
</script>
