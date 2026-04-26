<template>
  <view class="question-card" @touchstart="onTouchStart" @touchend="onTouchEnd">
    <view class="q-header">
      <text class="q-num">第 {{ index + 1 }} 题</text>
    </view>
    <view class="q-text-wrap">
      <text class="q-text">{{ question.text }}</text>
    </view>
    <view class="q-options">
      <view
        v-for="(opt, i) in question.options"
        :key="i"
        class="option-item"
        :class="{ selected: selectedIndex === i }"
        @click="onSelect(i)"
      >
        <view class="option-radio" :class="{ selected: selectedIndex === i }">
          <text class="radio-label">{{ ['A', 'B'][i] }}</text>
        </view>
        <text class="option-text">{{ opt.text }}</text>
        <view class="option-check" v-if="selectedIndex === i">✓</view>
      </view>
    </view>
    <view class="swipe-hint" v-show="selectedIndex === -1">
      <text class="hint-text">← 左右滑动也可切换题目 →</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  question: Object,
  index: Number,
  selectedIndex: { type: Number, default: -1 }
})
const emit = defineEmits(['select', 'swipeLeft', 'swipeRight'])
const touchStartX = ref(0)
const touchStartY = ref(0)

function onSelect(i) { emit('select', i) }

function onTouchStart(e) {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
}

function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX.value
  const dy = e.changedTouches[0].clientY - touchStartY.value
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
    if (dx < 0) emit('swipeLeft')
    else emit('swipeRight')
  }
}
</script>

<style scoped>
.question-card {
  padding: 24px 20px 16px;
  display: flex;
  flex-direction: column;
  max-width: 680px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.q-header {
  text-align: center;
  margin-bottom: 20px;
}

.q-num {
  font-size: 13px;
  color: var(--accent);
  font-weight: 600;
  background: var(--accent-light);
  padding: 4px 14px;
  border-radius: 20px;
  border: 1px solid var(--accent-border);
  display: inline-block;
}

.q-text-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 0 36px;
}

.q-text {
  font-size: 18px;
  color: var(--text-primary);
  line-height: 1.7;
  text-align: center;
  font-weight: 500;
}

@media (max-width: 480px) {
  .q-text { font-size: 16px; }
}

.q-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.18s;
  background: var(--bg-card);
  position: relative;
}

.option-item:hover {
  border-color: var(--accent-border);
  background: var(--accent-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.option-item.selected {
  border-color: var(--accent);
  background: var(--accent-light);
  box-shadow: 0 0 0 1px var(--accent);
}

.option-radio {
  width: 32px;
  height: 32px;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.18s;
  background: var(--bg-primary);
}

.option-radio.selected {
  background: var(--accent);
  border-color: var(--accent);
}

.radio-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 700;
  transition: color 0.18s;
}

.option-radio.selected .radio-label {
  color: #fff;
}

.option-text {
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.5;
  flex: 1;
}

.option-check {
  color: var(--accent);
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.swipe-hint {
  text-align: center;
  margin-top: 20px;
  padding-top: 16px;
}

.hint-text {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.3px;
}
</style>
