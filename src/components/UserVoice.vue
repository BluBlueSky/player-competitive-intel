<template>
  <section v-if="hasContent" class="mb-10">
    <div class="flex items-center gap-2 mb-5">
      <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
        <span class="w-1 h-5 bg-amber-500 rounded-full"></span>
        用户心声
      </h2>
      <span class="text-xs text-slate-400 ml-2">来自应用商店评论的真实需求</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Unmet Needs -->
      <div v-if="unmetNeeds && unmetNeeds.length > 0" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="px-5 py-3.5 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
          <h3 class="font-semibold text-orange-800 text-sm">未满足需求 = 我们的机会</h3>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="(need, i) in unmetNeeds" :key="i" class="px-5 py-4">
            <p class="text-sm font-medium text-slate-800">{{ need.need }}</p>
            <p class="text-xs text-slate-500 mt-1.5 leading-relaxed italic">"{{ need.evidence }}"</p>
            <div class="flex items-center gap-2 mt-2">
              <span
                v-for="app in need.affectedApps"
                :key="app"
                class="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-500"
              >{{ app }}</span>
            </div>
            <div v-if="need.opportunity" class="mt-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded">
              <span class="font-medium">机会:</span> {{ need.opportunity }}
            </div>
          </div>
        </div>
      </div>

      <!-- Satisfaction Shifts -->
      <div v-if="satisfactionShifts && satisfactionShifts.length > 0" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="px-5 py-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <h3 class="font-semibold text-blue-800 text-sm">满意度变化信号</h3>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="(shift, i) in satisfactionShifts" :key="i" class="px-5 py-4">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{{ shift.app }}</span>
              <span
                class="text-[11px] font-medium px-1.5 py-0.5 rounded"
                :class="shift.direction === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'"
              >
                {{ shift.direction === 'up' ? '↑ 满意度上升' : '↓ 满意度下降' }}
              </span>
            </div>
            <p class="text-xs text-slate-600 mt-1.5 leading-relaxed">{{ shift.signal }}</p>
            <p v-if="shift.implication" class="text-xs text-indigo-600 mt-1.5 font-medium">
              对我们: {{ shift.implication }}
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
  unmetNeeds?: Array<{
    need: string
    evidence: string
    affectedApps: string[]
    opportunity?: string
  }>
  satisfactionShifts?: Array<{
    app: string
    direction: string
    signal: string
    implication?: string
  }>
}>()

const hasContent = computed(() =>
  (props.unmetNeeds && props.unmetNeeds.length > 0) ||
  (props.satisfactionShifts && props.satisfactionShifts.length > 0)
)
</script>
