<template>
  <view class="test-page">
    <!-- Top Navigation -->
    <view class="topbar">
      <view class="topbar-left">
        <text class="breadcrumb-link" @click="showQuit = true">← 首页</text>
        <text class="breadcrumb-sep">/</text>
        <text class="breadcrumb-current">MBTI 测试</text>
      </view>
      <view class="topbar-right">
        <text class="topbar-time">{{ clock }}</text>
        <view class="icon-btn" @click="settings.showSettings = true">
          <text class="icon-gear">⚙</text>
        </view>
      </view>
    </view>

    <!-- Progress Bar -->
    <ProgressBar :current="store.currentIndex + 1" :total="store.totalQuestions" />

    <!-- Loading State -->
    <view class="loading-state" v-if="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在加载题目…</text>
    </view>

    <!-- Question Area -->
    <view class="question-stage" v-else>
      <transition name="slide" mode="out-in">
        <QuestionCard
          v-if="store.questions[store.currentIndex]"
          :key="store.currentIndex"
          :question="store.questions[store.currentIndex]"
          :index="store.currentIndex"
          :selected-index="getSelectedIndex(store.currentIndex)"
          @select="(optIdx) => onAnswer(store.currentIndex, optIdx)"
          @swipeLeft="goNext"
          @swipeRight="goPrev"
        />
      </transition>
    </view>

    <!-- Bottom Navigation -->
    <view class="test-footer" v-if="!loading">
      <view class="footer-btn prev" :class="{ hidden: store.isFirstQuestion }" @click="goPrev">
        ← 上一题
      </view>
      <view class="footer-hint" v-if="!hasAnswered">请选择一个选项</view>
      <view class="footer-btn next" v-if="hasAnswered && !store.isLastQuestion" @click="goNext">
        下一题 →
      </view>
      <view class="footer-btn submit" v-if="store.isLastQuestion && hasAnswered" @click="goNext">
        查看结果 →
      </view>
    </view>

    <!-- Quit Modal -->
    <view class="modal-overlay" v-if="showQuit" @click="showQuit = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">确认退出？</text>
        <text class="modal-desc">测试进度将自动保存，你可以随时回来继续</text>
        <view class="modal-actions">
          <view class="btn btn-outline btn-sm" @click="showQuit = false">继续答题</view>
          <view class="btn btn-primary btn-sm" @click="onQuit">退出</view>
        </view>
      </view>
    </view>

    <!-- Settings Panel -->
    <view class="settings-overlay" v-if="settings.showSettings" @click="settings.showSettings = false">
      <view class="settings-card" @click.stop>
        <text class="settings-title">显示设置</text>
        <view class="setting-row">
          <text class="setting-label">深色模式</text>
          <view class="toggle" :class="{ active: settings.darkMode }" @click="settings.toggleDark()">
            <view class="toggle-knob"></view>
          </view>
        </view>
        <view class="btn btn-outline btn-sm" style="margin-top: 16px; width: 100%;" @click="settings.showSettings = false">关闭</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTestStore, useSettingsStore } from '../../store'
import ProgressBar from '../../components/ProgressBar.vue'
import QuestionCard from '../../components/QuestionCard.vue'

const store = useTestStore()
const settings = useSettingsStore()
const showQuit = ref(false)
const loading = ref(true)
const clock = ref('')
let clockTimer

const hasAnswered = computed(() => store.hasAnswered(store.currentIndex))

onMounted(async () => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)

  if (store.questions.length === 0) {
    try {
      const [qRes, pRes] = await Promise.all([
        uni.request({ url: '/static/questions.json' }),
        uni.request({ url: '/static/personality-types.json' })
      ])
      store.initTest(qRes.data)
      uni.setStorageSync('personality_types', pRes.data)
    } catch (e) {
      console.error('Failed to load questions:', e)
    }
  } else {
    const saved = uni.getStorageSync('mbti_test_state')
    if (saved && saved.questions === store.questions.length) {
      store.currentIndex = saved.currentIndex || 0
      store.answers = saved.answers || []
      store.scores = saved.scores || { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
    }
  }
  loading.value = false
})

onUnmounted(() => {
  clearInterval(clockTimer)
})

function updateClock() {
  const now = new Date()
  clock.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function getSelectedIndex(questionIdx) {
  const answer = store.getAnswer(questionIdx)
  if (!answer) return -1
  const q = store.questions[questionIdx]
  if (!q) return -1
  return q.options.findIndex(o => Object.keys(o.score)[0] === answer.dimension)
}

function onAnswer(qIdx, optIdx) {
  const opt = store.questions[qIdx]?.options[optIdx]
  if (!opt) return
  const scoreKey = Object.keys(opt.score)[0]
  store.answerQuestion(qIdx, scoreKey)
  if (store.isLastQuestion) {
    submitTest()
  } else {
    setTimeout(() => store.goNext(), 300)
  }
}

function goNext() {
  if (!hasAnswered.value) return
  if (store.isLastQuestion) {
    submitTest()
  } else {
    store.goNext()
  }
}

function goPrev() {
  if (!store.isFirstQuestion) store.goPrev()
}

async function submitTest() {
  let personalityTypes = uni.getStorageSync('personality_types')
  if (!personalityTypes) {
    try {
      const res = await uni.request({ url: '/static/personality-types.json' })
      personalityTypes = res.data
    } catch (e) { return }
  }
  store.calculateResult(personalityTypes)
  uni.redirectTo({ url: '/pages/result/mbti' })
}

function onQuit() {
  showQuit.value = false
  uni.navigateBack()
}
</script>

<style scoped>
.test-page { height: 100vh; background: var(--bg-primary); display: flex; flex-direction: column; overflow: hidden; }

/* Top Bar */
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-bottom: 1px solid var(--border-color); background: var(--bg-card);
}
.topbar-left { display: flex; align-items: center; gap: 8px; }
.topbar-right { display: flex; align-items: center; gap: 8px; }
.breadcrumb-link { font-size: 13px; color: var(--text-secondary); cursor: pointer; transition: color 0.15s; }
.breadcrumb-link:hover { color: var(--accent); }
.breadcrumb-sep { font-size: 12px; color: var(--text-muted); }
.breadcrumb-current { font-size: 13px; color: var(--text-primary); font-weight: 600; }
.topbar-time { font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); background: var(--accent-light); padding: 3px 8px; border-radius: 6px; }
.icon-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; cursor: pointer; border: 1px solid var(--border-color); transition: all 0.15s; }
.icon-btn:hover { border-color: var(--accent); background: var(--accent-light); }
.icon-gear { font-size: 15px; }

/* Loading */
.loading-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 40px; }
.loading-spinner { width: 40px; height: 40px; border: 3px solid var(--accent-light); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 14px; color: var(--text-secondary); }

.question-stage { flex: 1; position: relative; overflow-y: auto; min-height: 0; }

/* Slide transition for questions */
.slide-enter-active { transition: all 0.22s ease-out; }
.slide-leave-active { transition: all 0.18s ease-in; }
.slide-enter-from { opacity: 0; transform: translateX(24px); }
.slide-leave-to { opacity: 0; transform: translateX(-24px); }

/* Bottom Footer */
.test-footer {
  display: flex; align-items: center; gap: 10px; padding: 14px 16px;
  border-top: 1px solid var(--border-color); background: var(--bg-card); min-height: 60px;
}
.footer-btn { padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.footer-btn.prev { border: 1px solid var(--border-color); color: var(--text-secondary); }
.footer-btn.prev:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
.footer-btn.prev.hidden { visibility: hidden; pointer-events: none; }
.footer-btn.next { background: var(--accent-gradient); color: #fff; border: none; margin-left: auto; }
.footer-btn.next:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(22,163,74,0.3); }
.footer-btn.submit { background: var(--accent-gradient); color: #fff; border: none; margin-left: auto; }
.footer-btn.submit:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(22,163,74,0.3); }
.footer-hint { flex: 1; text-align: center; font-size: 12px; color: var(--text-muted); }
.footer-hint.answered { color: var(--accent); }

/* Modal */
.modal-overlay {
  position: fixed; z-index: 999; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(2px);
}
.modal-content { background: var(--bg-card); border-radius: var(--radius-lg); padding: 28px; width: 320px; border: 1px solid var(--border-color); box-shadow: var(--shadow-lg); }
.modal-title { display: block; font-size: 17px; font-weight: 700; color: var(--text-primary); text-align: center; margin-bottom: 8px; }
.modal-desc { display: block; font-size: 13px; color: var(--text-secondary); text-align: center; margin-bottom: 22px; line-height: 1.6; }
.modal-actions { display: flex; gap: 8px; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 4px; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.15s; border: 1px solid transparent; padding: 8px 16px; font-size: 13px; }
.btn-primary { background: var(--accent-gradient); color: #fff; border: none; }
.btn-outline { border: 1px solid var(--border-color); color: var(--text-secondary); background: transparent; }
.btn-outline:hover { border-color: var(--accent); color: var(--accent); }
.btn-sm { padding: 6px 14px; font-size: 12px; }

/* Settings Overlay */
.settings-overlay {
  position: fixed; z-index: 1000; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(2px);
}
.settings-card {
  background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg);
  padding: 24px; width: 320px; box-shadow: var(--shadow-lg);
}
.settings-title { display: block; font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; }
.setting-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-color); }
.setting-row:last-of-type { border-bottom: none; }
.setting-label { font-size: 13px; color: var(--text-primary); }

.toggle { width: 42px; height: 24px; border-radius: 12px; background: var(--border-color); position: relative; cursor: pointer; transition: 0.25s; }
.toggle.active { background: var(--accent); }
.toggle-knob { width: 18px; height: 18px; border-radius: 50%; background: #fff; position: absolute; top: 3px; left: 3px; transition: 0.25s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.toggle.active .toggle-knob { left: 21px; }
</style>
