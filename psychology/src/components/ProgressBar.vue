<template>
  <view class="progress-bar">
    <view class="progress-info">
      <text class="progress-text">第 <text class="progress-current">{{ current }}</text>/{{ total }} 题</text>
      <text class="progress-pct">{{ percent }}%</text>
    </view>
    <view class="progress-track">
      <view class="progress-fill" :style="{ width: percent + '%' }"></view>
      <view class="milestone" v-for="m in milestones" :key="m" :style="{ left: m + '%' }" :class="{ passed: percent >= m }"></view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ current: Number, total: Number })
const percent = computed(() => props.total > 0 ? Math.round((props.current / props.total) * 100) : 0)
const milestones = [25, 50, 75]
</script>

<style scoped>
.progress-bar { padding: 12px 20px 10px; background: var(--bg-card); border-bottom: 1px solid var(--border-color); }
.progress-info { display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center; }
.progress-text { font-size: 13px; color: var(--text-secondary); }
.progress-current { font-weight: 700; color: var(--text-primary); }
.progress-pct { font-size: 13px; color: var(--accent); font-weight: 700; font-family: var(--font-mono); }
.progress-track {
  height: 6px; background: var(--accent-light); border-radius: 3px; overflow: visible;
  position: relative; border: 1px solid var(--accent-border);
}
.progress-fill {
  height: 100%; background: var(--accent-gradient); border-radius: 3px;
  transition: width 0.35s ease; position: relative;
}
.progress-fill::after {
  content: ''; position: absolute; right: -1px; top: 50%;
  transform: translateY(-50%); width: 10px; height: 10px;
  border-radius: 50%; background: var(--accent);
  border: 2px solid white; box-shadow: 0 1px 4px rgba(22,163,74,0.4);
}
.milestone {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 4px; height: 4px; border-radius: 50%;
  background: var(--accent-border); transition: background 0.3s;
  margin-left: -2px;
}
.milestone.passed { background: white; box-shadow: 0 0 0 1px var(--accent); }
</style>
