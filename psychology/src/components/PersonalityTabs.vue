<template>
  <view class="personality-tabs">
    <view class="tab-header">
      <view v-for="(tab, i) in tabs" :key="i" class="tab-item" :class="{ active: activeTab === i }" @click="activeTab = i">
        <text class="tab-label">{{ tab.label }}</text>
      </view>
    </view>
    <view class="tab-content">
      <scroll-view v-if="activeTab === 0" class="tab-scroll" scroll-y>
        <text class="tab-text">{{ showFull ? data.description : (data.portrait || data.description || '暂无数据') }}</text>
        <text class="expand-btn" v-if="data.portrait && data.description && data.description.length > 500" @click="showFull = !showFull">
          {{ showFull ? '收起' : '展开全文...' }}
        </text>
      </scroll-view>
      <scroll-view v-if="activeTab === 1" class="tab-scroll" scroll-y>
        <view v-for="(item, i) in data.career" :key="i" class="career-item">
          <text class="career-dot">•</text>
          <text class="career-text">{{ item }}</text>
        </view>
      </scroll-view>
      <scroll-view v-if="activeTab === 2" class="tab-scroll" scroll-y>
        <text class="section-label">优势</text>
        <view v-for="(item, i) in data.strengths" :key="i" class="swot-item positive">
          <text class="swot-icon">✓</text>
          <text class="swot-text">{{ item }}</text>
        </view>
        <text class="section-label" style="margin-top: 20rpx;">待提升</text>
        <view v-for="(item, i) in data.weaknesses" :key="i" class="swot-item negative">
          <text class="swot-icon">△</text>
          <text class="swot-text">{{ item }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
defineProps({ data: Object })
const tabs = ref([{ label: '性格画像' }, { label: '职场建议' }, { label: '优劣势分析' }])
const activeTab = ref(0)
const showFull = ref(false)
</script>

<style scoped>
.personality-tabs { margin-top: 20rpx; }
.tab-header { display: flex; border-bottom: 2rpx solid #eee; }
.tab-item { flex: 1; text-align: center; padding: 20rpx 0; }
.tab-item.active { border-bottom: 4rpx solid #667eea; }
.tab-item.active .tab-label { color: #667eea; font-weight: 600; }
.tab-label { font-size: 28rpx; color: #636e72; }
.tab-content { padding: 24rpx 0; }
.tab-scroll { max-height: 600rpx; }
.tab-text { font-size: 28rpx; line-height: 1.8; color: #555; white-space: pre-wrap; }
.expand-btn { display: block; text-align: center; font-size: 26rpx; color: #667eea; padding: 16rpx 0; }
.career-item { display: flex; gap: 12rpx; padding: 12rpx 0; }
.career-dot { color: #667eea; font-size: 28rpx; }
.career-text { font-size: 28rpx; color: #555; }
.section-label { display: block; font-size: 28rpx; font-weight: 600; color: #2d3436; margin-bottom: 12rpx; }
.swot-item { display: flex; gap: 12rpx; padding: 12rpx 20rpx; margin-bottom: 8rpx; border-radius: 8rpx; }
.swot-item.positive { background: #f0faf0; }
.swot-item.negative { background: #fff5f5; }
.swot-icon { font-size: 28rpx; flex-shrink: 0; }
.swot-item.positive .swot-icon { color: #00b894; }
.swot-item.negative .swot-icon { color: #e17055; }
.swot-text { font-size: 28rpx; color: #555; }
</style>
