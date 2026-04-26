<template>
  <view class="dimension-bar">
    <view class="dim-header">
      <text class="dim-label">{{ left.label }}</text>
      <text class="dim-pct">{{ left.pct }}%</text>
      <text class="dim-vs">VS</text>
      <text class="dim-pct">{{ right.pct }}%</text>
      <text class="dim-label">{{ right.label }}</text>
    </view>
    <view class="dim-track">
      <view class="dim-fill-left" :style="{ width: left.pct + '%', background: leftColor }"></view>
      <view class="dim-divider"></view>
      <view class="dim-fill-right" :style="{ width: right.pct + '%', background: rightColor }"></view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  left: Object, right: Object,
  leftColor: { type: String, default: '#667eea' },
  rightColor: { type: String, default: '#764ba2' }
})
</script>

<style scoped>
.dimension-bar { margin-bottom: 24rpx; }
.dim-header { display: flex; align-items: center; gap: 12rpx; margin-bottom: 10rpx; }
.dim-label { font-size: 26rpx; color: #636e72; font-weight: 600; flex: 1; }
.dim-label:last-child { text-align: right; }
.dim-pct { font-size: 28rpx; color: #2d3436; font-weight: 700; }
.dim-vs { font-size: 20rpx; color: #b2bec3; }
.dim-track { height: 16rpx; display: flex; border-radius: 8rpx; overflow: hidden; background: #eee; }
.dim-fill-left { height: 100%; border-radius: 8rpx 0 0 8rpx; transition: width 0.5s; }
.dim-fill-right { height: 100%; border-radius: 0 8rpx 8rpx 0; transition: width 0.5s; }
.dim-divider { width: 4rpx; background: #fff; flex-shrink: 0; }
</style>
