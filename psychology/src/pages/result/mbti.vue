<template>
  <view class="result-page">
    <!-- Top Navigation -->
    <view class="topbar">
      <view class="topbar-left">
        <text class="breadcrumb-link" @click="goHome">← 首页</text>
        <text class="breadcrumb-sep">/</text>
        <text class="breadcrumb-link" @click="goTest">{{ breadcrumbLabel }}</text>
        <text class="breadcrumb-sep">/</text>
        <text class="breadcrumb-current">结果报告</text>
      </view>
      <view class="topbar-right">
        <view class="btn btn-ghost btn-xs" @click="retakeTest">重新测试</view>
        <view class="icon-btn" @click="settings.showSettings = true"><text class="icon-gear">⚙</text></view>
      </view>
    </view>

    <!-- Hero Section -->
    <view class="hero-section">
      <view class="hero-bg-gradient"></view>
      <view class="hero-content">
        <view class="hero-badge">
          <text class="hero-type">{{ result.type }}</text>
          <text class="hero-subtitle">{{ result.subtitle }}</text>
        </view>
        <text class="hero-quote">“{{ soulQuote }}”</text>
        <!-- Tie warnings -->
        <view v-if="result.ties && result.ties.length > 0" class="tie-warning">
          <text class="tie-icon">⚖</text>
          <text class="tie-text">
            {{ result.ties.map(t => t.dim).join('、') }} 维度倾向不明显，特征偏中性
          </text>
        </view>
      </view>
    </view>

    <!-- Main Layout -->
    <view class="main-layout">
      <!-- Left Column: Charts & Dashboard -->
      <view class="col-main">
        <!-- Polarity Chart -->
        <view class="card">
          <view class="card-header">
            <text class="card-title">维度倾向</text>
            <text class="card-subtitle">各维度倾向强度分析</text>
          </view>
          <view class="polarity-chart">
            <view class="polarity-row" v-for="d in result.details" :key="d.dimension">
              <text class="polarity-label left" :class="{ dominant: d.left.pct > d.right.pct }">{{ d.left.label }}</text>
              <view class="polarity-track">
                <view class="polarity-bar left" :style="{ width: Math.max(0, d.left.pct - 50) + '%' }" :class="strengthClass(d.left.strength.level)"></view>
                <view class="polarity-center">
                  <text class="center-pct">{{ Math.max(d.left.pct, d.right.pct) }}%</text>
                </view>
                <view class="polarity-bar right" :style="{ width: Math.max(0, d.right.pct - 50) + '%' }" :class="strengthClass(d.right.strength.level)"></view>
              </view>
              <text class="polarity-label right" :class="{ dominant: d.right.pct > d.left.pct }">{{ d.right.label }}</text>
            </view>
          </view>
          <!-- Strength Legend -->
          <view class="strength-legend">
            <text class="legend-item" v-for="s in strengthLevels" :key="s.label">
              <view class="legend-dot" :class="s.class"></view>
              {{ s.label }}
            </text>
          </view>
        </view>

        <!-- 4 Info Cards -->
        <view class="info-grid">
          <!-- Portrait Card -->
          <view class="card info-card">
            <view class="info-icon portrait-icon">🧬</view>
            <text class="info-title">性格画像</text>
            <text class="info-text">{{ result.portrait ? result.portrait.slice(0, 200).replace(/##[\s\S]*?\n/g, '').trim() + '...' : result.description.slice(0, 200) + '...' }}</text>
          </view>
          <!-- Career Card -->
          <view class="card info-card">
            <view class="info-icon career-icon">💼</view>
            <text class="info-title">职场天赋</text>
            <view class="info-list">
              <text class="info-list-item" v-for="(c, i) in (result.career || []).slice(0, 5)" :key="i">• {{ c }}</text>
            </view>
          </view>
          <!-- Blindspot Card -->
          <view class="card info-card">
            <view class="info-icon blindspot-icon">🔍</view>
            <text class="info-title">盲点建议</text>
            <view class="info-list">
              <text class="info-list-item" v-for="(w, i) in (result.weaknesses || []).slice(0, 4)" :key="i">• {{ w }}</text>
            </view>
          </view>
          <!-- Partner Card -->
          <view class="card info-card">
            <view class="info-icon partner-icon">💞</view>
            <text class="info-title">理想拍档</text>
            <text class="info-text">与{{ idealPartner }}类型的人在性格上形成天然互补，能够相互成就、共同成长。</text>
          </view>
        </view>
      </view>

      <!-- Right Column: Dashboard -->
      <view class="col-side">
        <!-- Reliability -->
        <view class="card dashboard-card">
          <text class="card-title">测算可靠度</text>
          <view class="reliability-ring">
            <svg viewBox="0 0 120 120" class="ring-svg">
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--accent-light)" stroke-width="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#16a34a" stroke-width="8" stroke-linecap="round"
                :stroke-dasharray="2 * Math.PI * 52"
                :stroke-dashoffset="2 * Math.PI * 52 * (1 - result.reliability / 100)"
                transform="rotate(-90 60 60)" />
            </svg>
            <text class="reliability-value">{{ result.reliability }}%</text>
          </view>
          <text class="reliability-desc">
            {{ result.reliability >= 90 ? '答题完整度高，结果非常可靠' : result.reliability >= 70 ? '结果基本可靠，参考价值较高' : '题目未完全作答，结果仅供参考' }}
          </text>
        </view>

        <!-- 16-Type Distribution -->
        <view class="card dashboard-card">
          <text class="card-title">16 种人格分布</text>
          <view class="dist-grid">
            <view
              v-for="pt in allTypes"
              :key="pt.type"
              class="dist-cell"
              :class="{ active: pt.type === result.type }"
              @click="hoverType = pt.type"
            >
              <text class="dist-code">{{ pt.type }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Action Buttons -->
    <view class="action-bar">
      <view class="btn btn-primary" @click="showShare = true">生成分享海报</view>
      <view class="btn btn-outline" @click="retakeTest">重新测试</view>
      <view class="btn btn-outline" @click="goHome">返回首页</view>
    </view>

    <!-- Footer -->
    <view class="footer">
      <text class="footer-text">Soul ioStar · 心理测评工具</text>
    </view>

    <!-- Share Poster Modal -->
    <SharePoster
      :visible="showShare"
      :type="result.type"
      :subtitle="result.subtitle"
      :details="result.details"
      :reliability="result.reliability"
      :keywords="keywords"
      :quote="soulQuote"
      @close="showShare = false"
    />

    <!-- Settings -->
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
import { ref, computed, onMounted } from 'vue'
import { useTestStore, useSettingsStore } from '../../store'
import SharePoster from '../../components/SharePoster.vue'
import { getKeywords, getSoulQuote } from '../../utils/keywords'

const store = useTestStore()
const settings = useSettingsStore()
const showShare = ref(false)
const hoverType = ref('')
const allTypes = ref([])

const breadcrumbLabel = computed(() => result.value.testLabel || 'MBTI 测试')

const result = computed(() => store.result || {
  type: '--', subtitle: '加载中...', details: [], ties: [], reliability: 0,
  description: '', portrait: '', career: [], strengths: [], weaknesses: []
})

const keywords = computed(() => getKeywords(result.value.type))
const soulQuote = computed(() => getSoulQuote(result.value.type))

const strengthLevels = [
  { label: '极强', class: 'strong' },
  { label: '中等', class: 'medium' },
  { label: '轻微', class: 'light' }
]

const idealPartner = computed(() => {
  const map = {
    ENFJ: 'ISTP', ENFP: 'ISTJ', ENTJ: 'INFP', ENTP: 'ISFJ',
    ESFJ: 'INTP', ESFP: 'ISTJ', ESTJ: 'INFP', ESTP: 'INFJ',
    INFJ: 'ESTP', INFP: 'ENTJ', INTJ: 'ENFP', INTP: 'ESFJ',
    ISFJ: 'ENTP', ISFP: 'ENTJ', ISTJ: 'ESFP', ISTP: 'ENFJ'
  }
  return map[result.value.type] || 'ENFP'
})

function strengthClass(level) {
  return level === 3 ? 'strong' : level === 2 ? 'medium' : 'light'
}

onMounted(async () => {
  if (!store.isCompleted || !store.result) {
    const personalityTypes = uni.getStorageSync('personality_types')
    const hasAnswers = Object.values(store.scores).some(v => v > 0)
    if (personalityTypes && hasAnswers) {
      store.calculateResult(personalityTypes)
    } else {
      uni.redirectTo({ url: result.value.testPage || '/pages/test/mbti' })
      return
    }
  }

  // Load all types for distribution grid
  try {
    const pt = uni.getStorageSync('personality_types')
    if (pt) allTypes.value = pt
  } catch (e) {}
})

function retakeTest() {
  store.resetTest()
  uni.redirectTo({ url: result.value.testPage || '/pages/test/mbti' })
}

function goHome() {
  uni.reLaunch({ url: '/pages/index/index' })
}

function goTest() {
  uni.redirectTo({ url: result.value.testPage || '/pages/test/mbti' })
}

</script>

<style scoped>
.result-page { min-height: 100vh; background: var(--bg-primary); padding-bottom: 40px; }

/* ===== Hero ===== */
.hero-section { position: relative; padding: 52px 16px 44px; text-align: center; overflow: hidden; }
.hero-bg-gradient {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, #052e16 0%, #064e3b 50%, #065f46 100%);
  z-index: 0;
}
.hero-content { position: relative; z-index: 1; }
.hero-badge { margin-bottom: 16px; }
.hero-type { display: block; font-size: 72px; font-weight: 900; color: #fff; letter-spacing: 12px; font-family: var(--font-mono); line-height: 1; text-shadow: 0 0 40px rgba(74,222,128,0.3); }
.hero-subtitle { display: block; font-size: 19px; color: rgba(255,255,255,0.85); margin-top: 14px; font-weight: 500; }
.hero-quote { display: block; font-size: 14px; color: rgba(187,247,208,0.75); font-style: italic; margin-top: 16px; max-width: 420px; margin-left: auto; margin-right: auto; line-height: 1.7; }

.tie-warning { display: inline-flex; align-items: center; gap: 6px; margin-top: 16px; background: rgba(251,191,36,0.15); padding: 6px 16px; border-radius: 20px; border: 1px solid rgba(251,191,36,0.3); }
.tie-icon { font-size: 14px; }
.tie-text { font-size: 12px; color: rgba(253,230,138,0.9); }

/* ===== Main Layout ===== */
.main-layout { display: flex; gap: 16px; max-width: 1100px; margin: 0 auto; padding: 0 16px; }
.col-main { flex: 1; min-width: 0; }
.col-side { width: 240px; flex-shrink: 0; display: none; }

@media (min-width: 800px) {
  .col-side { display: flex; flex-direction: column; }
}

/* ===== Card Base ===== */
.card {
  background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm); padding: 20px; margin-bottom: 16px;
}
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }
.card-subtitle { font-size: 12px; color: var(--text-muted); }

/* ===== Polarity Chart ===== */
.polarity-chart { display: flex; flex-direction: column; gap: 18px; }
.polarity-row { display: flex; align-items: center; gap: 10px; }
.polarity-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); width: 26px; font-family: var(--font-mono); transition: color 0.2s; }
.polarity-label.dominant { color: var(--accent); font-weight: 700; }
.polarity-label.right { text-align: right; }
.polarity-track {
  flex: 1; height: 20px; position: relative; display: flex; align-items: center;
  background: var(--accent-light); border-radius: 10px; overflow: hidden;
  border: 1px solid var(--accent-border);
}
.polarity-bar { height: 100%; border-radius: 10px; transition: width 0.6s cubic-bezier(0.4,0,0.2,1); min-width: 0; }
.polarity-bar.left { background: var(--accent-gradient); margin-right: auto; border-radius: 10px 0 0 10px; }
.polarity-bar.right { background: linear-gradient(135deg, #059669, #047857); margin-left: auto; border-radius: 0 10px 10px 0; }
.polarity-bar.strong { opacity: 1; }
.polarity-bar.medium { opacity: 0.75; }
.polarity-bar.light { opacity: 0.45; }
.polarity-center {
  position: absolute; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; z-index: 2;
}
.center-pct {
  font-size: 11px; font-weight: 700; color: var(--text-primary);
  background: var(--bg-card); padding: 1px 5px; border-radius: 4px;
  border: 1px solid var(--border-color); font-family: var(--font-mono);
}

.strength-legend { display: flex; gap: 14px; justify-content: center; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border-color); }
.legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text-muted); }
.legend-dot { border-radius: 3px; background: var(--accent); }
.legend-dot.strong { width: 16px; height: 8px; opacity: 1; }
.legend-dot.medium { width: 12px; height: 7px; opacity: 0.75; }
.legend-dot.light { width: 8px; height: 6px; opacity: 0.45; }

/* ===== Info Cards ===== */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 540px) { .info-grid { grid-template-columns: 1fr; } }
.info-card { transition: box-shadow 0.2s; }
.info-icon { font-size: 30px; margin-bottom: 10px; display: block; }
.info-title { display: block; font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color); }
.info-text { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
.info-list { display: flex; flex-direction: column; gap: 6px; }
.info-list-item { font-size: 13px; color: var(--text-secondary); line-height: 1.5; padding: 3px 0; }

/* ===== Dashboard ===== */
.dashboard-card { text-align: center; }
.reliability-ring { position: relative; width: 120px; height: 120px; margin: 0 auto 12px; }
.ring-svg { width: 100%; height: 100%; }
.reliability-value { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 22px; font-weight: 800; color: var(--accent); font-family: var(--font-mono); }
.reliability-desc { display: block; font-size: 11px; color: var(--text-secondary); line-height: 1.6; margin-top: 4px; }

.dist-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-top: 8px; }
.dist-cell { padding: 5px 2px; border-radius: 5px; border: 1px solid var(--border-color); cursor: pointer; text-align: center; transition: 0.15s; }
.dist-cell:hover { border-color: var(--accent-border); background: var(--accent-light); }
.dist-cell.active { border-color: var(--accent); background: var(--accent-light); box-shadow: 0 0 0 1px var(--accent); }
.dist-cell.active .dist-code { color: var(--accent); font-weight: 700; }
.dist-code { font-size: 10px; font-weight: 600; color: var(--text-muted); font-family: var(--font-mono); }

/* ===== Action Bar ===== */
.action-bar { display: flex; gap: 10px; justify-content: center; padding: 16px; max-width: 1100px; margin: 0 auto; }
.action-bar .btn { padding: 10px 24px; font-size: 13px; }

/* ===== Buttons ===== */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 4px; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.15s; border: 1px solid transparent; padding: 8px 16px; font-size: 13px; }
.btn-primary { background: var(--accent-gradient); color: #fff; border: none; }
.btn-primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(22,163,74,0.3); }
.btn-outline { border: 1px solid var(--border-color); color: var(--text-secondary); background: transparent; }
.btn-outline:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
.btn-ghost { background: transparent; color: var(--text-secondary); border: none; }
.btn-ghost:hover { color: var(--accent); background: var(--accent-light); border-radius: 6px; }
.btn-xs { padding: 5px 12px; font-size: 12px; border-radius: 6px; }

/* ===== Footer ===== */
.footer { text-align: center; padding: 32px 16px; }
.footer-text { font-size: 11px; color: var(--text-muted); }

/* ===== Top Bar ===== */
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border-color); background: var(--bg-card); }
.topbar-left { display: flex; align-items: center; gap: 6px; }
.topbar-right { display: flex; align-items: center; gap: 8px; }
.breadcrumb-link { font-size: 12px; color: var(--text-secondary); cursor: pointer; transition: color 0.15s; }
.breadcrumb-link:hover { color: var(--accent); }
.breadcrumb-sep { font-size: 11px; color: var(--text-muted); }
.breadcrumb-current { font-size: 12px; color: var(--text-primary); font-weight: 600; }
.icon-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; cursor: pointer; border: 1px solid var(--border-color); transition: all 0.15s; }
.icon-btn:hover { border-color: var(--accent); background: var(--accent-light); }
.icon-gear { font-size: 15px; }

/* ===== Settings ===== */
.settings-overlay { position: fixed; z-index: 1000; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
.settings-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; width: 320px; box-shadow: var(--shadow-lg); }
.settings-title { display: block; font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; }
.setting-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-color); }
.setting-row:last-of-type { border-bottom: none; }
.setting-label { font-size: 13px; color: var(--text-primary); }
.toggle { width: 42px; height: 24px; border-radius: 12px; background: var(--border-color); position: relative; cursor: pointer; transition: 0.25s; }
.toggle.active { background: var(--accent); }
.toggle-knob { width: 18px; height: 18px; border-radius: 50%; background: #fff; position: absolute; top: 3px; left: 3px; transition: 0.25s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.toggle.active .toggle-knob { left: 21px; }

/* ===== Dark ===== */
.dark .hero-bg-gradient { background: linear-gradient(135deg, #020c05 0%, #042714 50%, #052e16 100%); }
</style>
