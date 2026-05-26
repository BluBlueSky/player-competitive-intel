<template>
  <section v-if="hasContent" class="mb-10">
    <div class="flex items-center gap-2 mb-5">
      <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
        <span class="w-1 h-5 bg-violet-500 rounded-full"></span>
        竞品动态与回应建议
      </h2>
    </div>

    <!-- This Week's Moves -->
    <div v-if="moves && moves.length > 0" class="space-y-4 mb-6">
      <div
        v-for="(move, i) in moves"
        :key="i"
        class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow"
      >
        <div class="flex items-start gap-4">
          <!-- Urgency indicator -->
          <div class="flex-shrink-0 mt-0.5">
            <span
              class="inline-block w-2.5 h-2.5 rounded-full"
              :class="urgencyDot(move.urgency)"
              :title="urgencyLabel(move.urgency)"
            ></span>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{{ move.competitor }}</span>
              <span
                class="text-[10px] font-medium px-1.5 py-0.5 rounded"
                :class="urgencyBadge(move.urgency)"
              >{{ urgencyLabel(move.urgency) }}</span>
            </div>
            <p class="text-sm font-medium text-slate-800 mt-1">{{ move.move }}</p>

            <!-- Our Response -->
            <div class="mt-3 pl-3 border-l-2 border-indigo-200 bg-indigo-50/50 rounded-r-lg py-2 pr-3">
              <p class="text-xs font-semibold text-indigo-700 mb-0.5">建议响应</p>
              <p class="text-xs text-indigo-600 leading-relaxed">{{ move.ourResponse }}</p>
            </div>

            <div class="flex items-center gap-3 mt-3">
              <span
                v-if="move.confidence"
                class="text-[10px] px-1.5 py-0.5 rounded"
                :class="confidenceClass(move.confidence)"
              >置信度: {{ move.confidence === 'high' ? '高' : move.confidence === 'medium' ? '中' : '低' }}</span>
              <a
                v-if="move.sourceUrl"
                :href="move.sourceUrl"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-0.5 text-[11px] text-indigo-500 hover:text-indigo-700"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                溯源
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Feature Gap Alerts -->
    <div v-if="featureGaps && featureGaps.length > 0">
      <h3 class="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
        功能差距警告
      </h3>
      <div class="bg-amber-50/50 rounded-xl border border-amber-200 overflow-hidden">
        <div class="divide-y divide-amber-100">
          <div v-for="(gap, i) in featureGaps" :key="i" class="px-5 py-4">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-slate-800">{{ gap.feature }}</p>
              <span
                class="text-[10px] font-medium px-1.5 py-0.5 rounded"
                :class="gap.priority === 'high' ? 'bg-red-100 text-red-700' : gap.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'"
              >{{ gap.priority === 'high' ? '高优' : gap.priority === 'medium' ? '中优' : '低优' }}</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              <span class="font-medium">已有:</span> {{ gap.whoHasIt?.join(', ') || '未知' }}
            </p>
            <p v-if="gap.userDemandSignal" class="text-xs text-amber-700 mt-1">
              需求信号: {{ gap.userDemandSignal }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  moves?: Array<{
    competitor: string
    move: string
    ourResponse: string
    urgency: string
    sourceUrl?: string
    confidence?: string
  }>
  featureGaps?: Array<{
    feature: string
    whoHasIt?: string[]
    userDemandSignal?: string
    priority: string
  }>
}>()

const hasContent = computed(() =>
  (props.moves && props.moves.length > 0) ||
  (props.featureGaps && props.featureGaps.length > 0)
)

function urgencyDot(urgency: string) {
  switch (urgency) {
    case 'immediate': return 'bg-red-500 animate-pulse'
    case 'this_quarter': return 'bg-amber-500'
    case 'watch': return 'bg-slate-400'
    default: return 'bg-slate-300'
  }
}

function urgencyBadge(urgency: string) {
  switch (urgency) {
    case 'immediate': return 'bg-red-100 text-red-700'
    case 'this_quarter': return 'bg-amber-100 text-amber-700'
    case 'watch': return 'bg-slate-100 text-slate-600'
    default: return 'bg-slate-100 text-slate-600'
  }
}

function urgencyLabel(urgency: string) {
  switch (urgency) {
    case 'immediate': return '需立即响应'
    case 'this_quarter': return '本季度跟进'
    case 'watch': return '持续观察'
    default: return '观察'
  }
}

function confidenceClass(confidence: string) {
  switch (confidence) {
    case 'high': return 'bg-emerald-100 text-emerald-700'
    case 'medium': return 'bg-amber-100 text-amber-700'
    case 'low': return 'bg-red-100 text-red-700'
    default: return 'bg-slate-100 text-slate-600'
  }
}
</script>
