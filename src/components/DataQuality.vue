<template>
  <section v-if="data" class="mb-10">
    <div class="flex items-center gap-2 mb-4">
      <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
        <span class="w-1 h-5 bg-slate-400 rounded-full"></span>
        数据来源与质量
      </h2>
    </div>

    <div class="bg-slate-50 rounded-xl border border-slate-200 p-5">
      <!-- Caveat -->
      <p v-if="data.caveat" class="text-sm text-slate-600 mb-4 italic">
        {{ data.caveat }}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Sources Used -->
        <div>
          <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">本期有效数据源</h4>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="source in data.sourcesUsed"
              :key="source"
              class="text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium"
            >
              {{ source }}
            </span>
          </div>
        </div>

        <!-- Sources Failed -->
        <div v-if="data.sourcesFailed && data.sourcesFailed.length > 0">
          <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">采集失败/无数据</h4>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="source in data.sourcesFailed"
              :key="source"
              class="text-[11px] px-2.5 py-1 rounded-full bg-red-100 text-red-600 font-medium"
            >
              {{ source }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  data: {
    sourcesUsed: string[]
    sourcesFailed: string[]
    overallConfidence: string
    caveat: string
  }
}>()
</script>
