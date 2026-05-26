<template>
  <span class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
    <span>{{ icon }}</span>
    <span>{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ source: string }>()

const iconMap: Record<string, string> = {
  zhihu: '🔍',
  appstore: '📱',
  website: '🌐',
  boss: '👔',
  qimai: '📊',
  diandian: '📈',
  similarweb: '🌍'
}

const icon = computed(() => iconMap[props.source] || '📌')
const label = computed(() => {
  const map: Record<string, string> = {
    zhihu: '知乎',
    appstore: '应用商店',
    website: '官网',
    boss: 'Boss直聘',
    qimai: '七麦数据',
    diandian: '点点数据',
    similarweb: 'SimilarWeb'
  }
  return map[props.source] || props.source
})
</script>
