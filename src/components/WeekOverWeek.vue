<template>
  <section v-if="hasContent" class="mb-10">
    <div class="flex items-center gap-2 mb-5">
      <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
        <span class="w-1 h-5 bg-cyan-500 rounded-full"></span>
        周环比变化
      </h2>
      <span class="text-xs text-slate-400 ml-2">与上期对比</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- New This Week -->
      <div v-if="data.newThisWeek && data.newThisWeek.length > 0" class="bg-white rounded-xl border border-emerald-200 overflow-hidden">
        <div class="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
          <h3 class="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            本周新信号
          </h3>
        </div>
        <ul class="divide-y divide-slate-50">
          <li v-for="(item, i) in data.newThisWeek" :key="i" class="px-4 py-3 text-xs text-slate-700 leading-relaxed">
            {{ item }}
          </li>
        </ul>
      </div>

      <!-- Continued -->
      <div v-if="data.continuedFromLastWeek && data.continuedFromLastWeek.length > 0" class="bg-white rounded-xl border border-amber-200 overflow-hidden">
        <div class="px-4 py-3 bg-amber-50 border-b border-amber-100">
          <h3 class="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            持续关注中
          </h3>
        </div>
        <ul class="divide-y divide-slate-50">
          <li v-for="(item, i) in data.continuedFromLastWeek" :key="i" class="px-4 py-3 text-xs text-slate-700 leading-relaxed">
            {{ item }}
          </li>
        </ul>
      </div>

      <!-- Resolved / Faded -->
      <div v-if="data.resolvedOrFaded && data.resolvedOrFaded.length > 0" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="px-4 py-3 bg-slate-50 border-b border-slate-100">
          <h3 class="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            已消退/解决
          </h3>
        </div>
        <ul class="divide-y divide-slate-50">
          <li v-for="(item, i) in data.resolvedOrFaded" :key="i" class="px-4 py-3 text-xs text-slate-500 leading-relaxed line-through decoration-slate-300">
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface WeekOverWeekData {
  newThisWeek?: string[]
  continuedFromLastWeek?: string[]
  resolvedOrFaded?: string[]
}

const props = defineProps<{ data: WeekOverWeekData }>()

const hasContent = computed(() =>
  (props.data.newThisWeek && props.data.newThisWeek.length > 0) ||
  (props.data.continuedFromLastWeek && props.data.continuedFromLastWeek.length > 0) ||
  (props.data.resolvedOrFaded && props.data.resolvedOrFaded.length > 0)
)
</script>
