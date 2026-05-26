<template>
  <section v-if="items && items.length > 0" class="mb-10">
    <div class="flex items-center gap-2 mb-5">
      <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
        <span class="w-1 h-5 bg-red-500 rounded-full"></span>
        本周行动项
      </h2>
      <span class="text-xs text-slate-400 ml-2">基于本周数据的决策建议</span>
    </div>

    <!-- Priority Groups -->
    <div class="space-y-4">
      <!-- P0 -->
      <div v-if="p0Items.length > 0">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-[11px] font-bold text-white bg-red-600 px-2 py-0.5 rounded">P0</span>
          <span class="text-xs text-red-700 font-medium">立即响应</span>
        </div>
        <div class="space-y-3">
          <ActionCard v-for="(item, i) in p0Items" :key="i" :item="item" priority="P0" />
        </div>
      </div>

      <!-- P1 -->
      <div v-if="p1Items.length > 0">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-[11px] font-bold text-white bg-amber-600 px-2 py-0.5 rounded">P1</span>
          <span class="text-xs text-amber-700 font-medium">本月启动</span>
        </div>
        <div class="space-y-3">
          <ActionCard v-for="(item, i) in p1Items" :key="i" :item="item" priority="P1" />
        </div>
      </div>

      <!-- P2 -->
      <div v-if="p2Items.length > 0">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-[11px] font-bold text-white bg-slate-500 px-2 py-0.5 rounded">P2</span>
          <span class="text-xs text-slate-600 font-medium">持续关注</span>
        </div>
        <div class="space-y-3">
          <ActionCard v-for="(item, i) in p2Items" :key="i" :item="item" priority="P2" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ActionCard from './ActionCard.vue'

interface ActionItem {
  priority: string
  action: string
  reason: string
  deadline?: string
  owner?: string
  confidence: string
  sourceRef: string
}

const props = defineProps<{ items: ActionItem[] }>()

const p0Items = computed(() => props.items.filter(i => i.priority === 'P0'))
const p1Items = computed(() => props.items.filter(i => i.priority === 'P1'))
const p2Items = computed(() => props.items.filter(i => i.priority === 'P2'))
</script>
