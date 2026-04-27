<template>
  <view class="home">
    <!-- ===== Top Navigation Bar ===== -->
    <view class="topbar">
      <view class="topbar-left">
        <text class="brand">Soultools</text>
        <text class="breadcrumb">首页</text>
      </view>
      <view class="topbar-right">
        <text class="topbar-time">{{ clock }}</text>
        <view class="icon-btn" @click="settings.showSettings = true">
          <text class="icon-gear">⚙</text>
        </view>
      </view>
    </view>

    <!-- ===== Main Layout: Two Columns on Wide Screen ===== -->
    <view class="main-layout">
      <!-- ===== Left Column ===== -->
      <view class="col-left">
        <!-- Data Panel -->
        <view class="card data-panel" v-if="hasProgress">
          <view class="card-header">
            <text class="card-title">测评进度</text>
            <view class="tag blue">进行中</view>
          </view>
          <view class="panel-grid">
            <view class="panel-item">
              <text class="panel-value">{{ progress.completed }}/93</text>
              <text class="panel-label">已完成题目</text>
            </view>
            <view class="panel-item">
              <text class="panel-value">~15min</text>
              <text class="panel-label">预计耗时</text>
            </view>
            <view class="panel-item" v-if="progress.lastTime">
              <text class="panel-value">{{ progress.lastTime }}</text>
              <text class="panel-label">上次测试</text>
            </view>
          </view>
          <view class="panel-actions">
            <view class="btn btn-primary btn-sm" @click="continueTest">继续答题</view>
            <view class="btn btn-outline btn-sm" @click="confirmReset = true">重新开始</view>
          </view>
        </view>

        <!-- Start Card (when no progress) -->
        <view class="card start-card" v-if="!hasProgress">
          <view class="start-icon">
            <text class="start-emoji">🌿</text>
          </view>
          <text class="start-title">METI 职业性格测试</text>
          <text class="start-desc">基于 MBTI 理论的 93 题专业测评，深入解读你的性格特质、职场优势与发展建议。</text>
          <view class="start-meta">
            <text class="meta-chip">93 题</text>
            <text class="meta-chip">约 15 分钟</text>
          </view>
          <view class="btn btn-primary btn-lg" @click="startTest">开始测评 →</view>
        </view>

        <!-- Personality Matrix Grid -->
        <view class="card matrix-card">
          <view class="card-header">
            <text class="card-title">16 种人格类型</text>
            <text class="card-subtitle">点击类型查看详情</text>
          </view>
          <view class="matrix-grid">
            <view
              v-for="pt in personalityTypes"
              :key="pt.type"
              class="matrix-cell"
              :class="[pt.type.substring(0,2).toLowerCase(), { active: hoveredType === pt.type }]"
              @mouseenter="hoveredType = pt.type"
              @mouseleave="hoveredType = null"
              @click="previewType(pt)"
            >
              <text class="cell-code">{{ pt.type }}</text>
              <text class="cell-name">{{ pt.subtitle.slice(0, 4) }}</text>
            </view>
          </view>
          <!-- Type Preview Popover -->
          <view class="type-preview" v-if="previewData">
            <view class="preview-header">
              <text class="preview-code">{{ previewData.type }}</text>
              <text class="preview-subtitle">{{ previewData.subtitle }}</text>
              <view class="preview-tags">
                <text class="preview-tag" v-for="kw in previewKeywords" :key="kw">{{ kw }}</text>
              </view>
            </view>
            <text class="preview-desc">{{ previewData.portrait ? previewData.portrait.slice(0, 150) + '...' : '' }}</text>
          </view>
        </view>
      </view>

      <!-- ===== Right Column (large screens) ===== -->
      <view class="col-right">
        <!-- Other Tests -->
        <view class="card other-tests-card" v-if="otherTests.length > 0">
          <text class="card-title">其他测试</text>
          <view class="other-test-item" v-for="t in otherTests" :key="t.id">
            <view class="other-test-icon">{{ t.icon }}</view>
            <view class="other-test-info">
              <text class="other-test-name">{{ t.name }}</text>
              <text class="other-test-desc">{{ t.desc }}</text>
              <text class="other-test-meta">{{ t.questionCount }} 题 · {{ t.time }}</text>
            </view>
            <view class="btn btn-primary btn-xs" @click="startOtherTest(t)">开始</view>
          </view>
        </view>

        <!-- Personality Ranking -->
        <view class="card ranking-card">
          <text class="card-title">热门人格</text>
          <view class="ranking-list">
            <view class="rank-item" v-for="(pt, i) in topTypes" :key="pt.type">
              <text class="rank-num">{{ i + 1 }}</text>
              <text class="rank-code">{{ pt.type }}</text>
              <text class="rank-name">{{ pt.subtitle }}</text>
            </view>
          </view>
        </view>

        <!-- Science Background -->
        <view class="card science-card">
          <text class="card-title">测评背景</text>
          <text class="science-text">基于荣格心理学类型理论，经过数十年研究验证。通过衡量四个维度上的倾向，揭示你独特的人格密码。</text>
          <view class="dim-chips">
            <text class="dim-chip"><text class="dim-bold">E/I</text> 外向/内向</text>
            <text class="dim-chip"><text class="dim-bold">S/N</text> 感觉/直觉</text>
            <text class="dim-chip"><text class="dim-bold">T/F</text> 思考/情感</text>
            <text class="dim-chip"><text class="dim-bold">J/P</text> 判断/知觉</text>
          </view>
        </view>
      </view>
    </view>

    <!-- ===== Settings Panel ===== -->
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

    <!-- ===== Reset Confirmation ===== -->
    <view class="settings-overlay" v-if="confirmReset" @click="confirmReset = false">
      <view class="settings-card" @click.stop>
        <text class="settings-title">确认重新开始</text>
        <text class="settings-desc">已保存的答题进度将被清除，确定要重新开始吗？</text>
        <view class="settings-actions">
          <view class="btn btn-outline btn-sm" @click="confirmReset = false">取消</view>
          <view class="btn btn-danger btn-sm" @click="doReset">确认清除</view>
        </view>
      </view>
    </view>

    <!-- ===== Footer ===== -->
    <view class="footer">
      <text class="footer-text">© 2026 Soul ioStar</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTestStore, useSettingsStore } from '../../store'
import { getKeywords } from '../../utils/keywords'

const store = useTestStore()
const settings = useSettingsStore()
const personalityTypes = ref([])
const hoveredType = ref('')
const previewData = ref(null)
const confirmReset = ref(false)
const clock = ref('')
let clockTimer

const previewKeywords = computed(() => previewData.value ? getKeywords(previewData.value.type) : [])

const otherTests = [
  {
    id: 'mbti16',
    name: 'MBTI 简易版',
    desc: '16题快速测评，了解你的性格倾向',
    questionCount: 16,
    time: '约3分钟',
    icon: '🌿',
    url: '/pages/test/mbti16'
  }
]

const hasProgress = computed(() => store.answers.length > 0)

const progress = computed(() => {
  const saved = uni.getStorageSync('mbti_test_state')
  const lastTime = saved ? saved.lastTime || '' : ''
  return {
    completed: store.answers.length,
    lastTime: lastTime ? new Date(lastTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''
  }
})

const topTypes = computed(() => {
  return personalityTypes.value.slice(0, 5)
})

onMounted(async () => {
  // Load personality types
  try {
    const res = await uni.request({ url: '/static/personality-types.json' })
    personalityTypes.value = res.data
    uni.setStorageSync('personality_types', res.data)
  } catch (e) {}

  // Load saved test state
  const saved = uni.getStorageSync('mbti_test_state')
  if (saved) {
    store.currentIndex = saved.currentIndex || 0
    store.answers = saved.answers || []
    store.scores = saved.scores || { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
  }

  // Load questions for data panel
  if (store.questions.length === 0) {
    try {
      const qRes = await uni.request({ url: '/static/questions.json' })
      store.questions = qRes.data
    } catch (e) {}
  }

  // Clock
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  clearInterval(clockTimer)
})

function updateClock() {
  const now = new Date()
  clock.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function startTest() {
  store.resetTest()
  uni.navigateTo({ url: '/pages/test/mbti' })
}

function continueTest() {
  uni.navigateTo({ url: '/pages/test/mbti' })
}

function previewType(pt) {
  previewData.value = previewData.value?.type === pt.type ? null : pt
}

function doReset() {
  confirmReset.value = false
  store.resetTest()
}

function startOtherTest(test) {
  uni.navigateTo({ url: test.url })
}
</script>

<style scoped>
/* ===== Layout ===== */
.home { min-height: 100vh; background: var(--bg-primary); padding: 0 16px 40px; }
.main-layout { display: flex; gap: 16px; max-width: 1100px; margin: 0 auto; }
.col-left { flex: 1; min-width: 0; }
.col-right { display: none; width: 300px; flex-shrink: 0; }

/* ===== Top Bar ===== */
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 0; border-bottom: 1px solid var(--border-color); margin-bottom: 20px;
}
.topbar-left { display: flex; align-items: center; gap: 10px; }
.brand { font-size: 18px; font-weight: 800; color: var(--accent); letter-spacing: -0.5px; }
.breadcrumb { font-size: 13px; color: var(--text-muted); }
.topbar-right { display: flex; align-items: center; gap: 10px; }
.topbar-time { font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); background: var(--accent-light); padding: 3px 8px; border-radius: 6px; }
.icon-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; cursor: pointer; border: 1px solid var(--border-color); transition: all 0.15s; }
.icon-btn:hover { border-color: var(--accent); background: var(--accent-light); }
.icon-gear { font-size: 15px; }

/* ===== Card Base ===== */
.card {
  background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm); padding: 20px; margin-bottom: 16px;
  transition: box-shadow 0.2s;
}
.card:hover { box-shadow: var(--shadow-md); }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }
.card-subtitle { font-size: 12px; color: var(--text-muted); }

/* ===== Data Panel ===== */
.panel-grid { display: flex; gap: 10px; margin-bottom: 16px; }
.panel-item { flex: 1; text-align: center; padding: 12px 8px; border-radius: var(--radius-sm); background: var(--accent-light); border: 1px solid var(--accent-border); }
.panel-value { display: block; font-size: 16px; font-weight: 700; color: var(--accent); font-family: var(--font-mono); margin-bottom: 4px; }
.panel-label { display: block; font-size: 11px; color: var(--text-secondary); }
.panel-actions { display: flex; gap: 8px; }

/* ===== Start Card ===== */
.start-card { text-align: center; padding: 36px 20px; background: linear-gradient(160deg, #fff 0%, #f0fdf4 100%); }
.start-icon { margin-bottom: 14px; }
.start-emoji { font-size: 52px; }
.start-title { display: block; font-size: 21px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px; }
.start-desc { display: block; font-size: 13px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 18px; max-width: 400px; margin-left: auto; margin-right: auto; }
.start-meta { display: flex; gap: 8px; justify-content: center; margin-bottom: 28px; flex-wrap: wrap; }

/* ===== Matrix Grid ===== */
.matrix-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.matrix-cell {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 10px 4px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);
  cursor: pointer; transition: all 0.15s; background: var(--bg-primary);
}
.matrix-cell:hover, .matrix-cell.active { border-color: var(--accent); background: var(--accent-light); }
.cell-code { font-size: 11px; font-weight: 700; color: var(--text-primary); font-family: var(--font-mono); letter-spacing: 1px; }
.cell-name { font-size: 10px; color: var(--text-muted); margin-top: 2px; }

/* 四象限颜色：EN=活力橙，ES=温暖黄，IN=深思紫，IS=自然绿 */
.matrix-cell.en .cell-code { color: #ea580c; }
.matrix-cell.es .cell-code { color: #ca8a04; }
.matrix-cell.in .cell-code { color: #7c3aed; }
.matrix-cell.is .cell-code { color: #16a34a; }

/* ===== Type Preview ===== */
.type-preview {
  margin-top: 14px; padding: 16px; border-radius: var(--radius-sm);
  background: var(--accent-light); border: 1px solid var(--accent-border);
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.preview-header { margin-bottom: 10px; }
.preview-code { font-size: 22px; font-weight: 800; color: var(--accent); font-family: var(--font-mono); letter-spacing: 3px; display: block; }
.preview-subtitle { font-size: 13px; color: var(--text-secondary); display: block; margin: 4px 0 10px; }
.preview-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px; }
.preview-tag { font-size: 11px; padding: 3px 9px; border-radius: 10px; background: white; border: 1px solid var(--accent-border); color: var(--accent); }
.preview-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.6; }

/* ===== Other Tests ===== */
.other-test-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 0; border-bottom: 1px solid var(--border-color);
}
.other-test-item:last-of-type { border-bottom: none; }
.other-test-icon { font-size: 22px; flex-shrink: 0; }
.other-test-info { flex: 1; min-width: 0; }
.other-test-name { display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); }
.other-test-desc { display: block; font-size: 11px; color: var(--text-secondary); margin-top: 1px; }
.other-test-meta { display: block; font-size: 10px; color: var(--text-muted); margin-top: 2px; }

/* ===== Ranking ===== */
.ranking-list { display: flex; flex-direction: column; gap: 4px; }
.rank-item { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border-radius: 8px; transition: background 0.15s; }
.rank-item:hover { background: var(--accent-light); }
.rank-item:nth-child(1) { background: rgba(234,179,8,0.08); }
.rank-item:nth-child(2) { background: rgba(148,163,184,0.08); }
.rank-item:nth-child(3) { background: rgba(180,83,9,0.06); }
.rank-num { font-size: 12px; font-weight: 700; color: var(--text-muted); width: 18px; }
.rank-code { font-size: 13px; font-weight: 700; color: var(--text-primary); font-family: var(--font-mono); }
.rank-name { font-size: 12px; color: var(--text-secondary); }

/* ===== Science Card ===== */
.science-text { font-size: 13px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 14px; }
.dim-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.dim-chip { font-size: 11px; padding: 5px 11px; border-radius: 8px; background: var(--accent-light); border: 1px solid var(--accent-border); color: var(--text-secondary); }
.dim-bold { font-weight: 700; color: var(--accent); }

/* ===== Buttons ===== */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 4px; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.15s; border: 1px solid transparent; }
.btn-primary { background: var(--accent-gradient); color: #fff; border: none; }
.btn-primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(22,163,74,0.3); }
.btn-outline { border: 1px solid var(--border-color); color: var(--text-secondary); background: transparent; }
.btn-outline:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
.btn-danger { background: #ef4444; color: #fff; border: none; }
.btn-danger:hover { background: #dc2626; }
.btn-lg { padding: 13px 36px; font-size: 15px; border-radius: 10px; }
.btn-sm { padding: 6px 14px; font-size: 12px; }
.btn-xs { padding: 4px 10px; font-size: 11px; border-radius: 6px; }

.tag { font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
.tag.blue { background: var(--accent-light); color: var(--accent); border: 1px solid var(--accent-border); }

.meta-chip { font-size: 11px; padding: 4px 11px; border-radius: 12px; background: var(--accent-light); border: 1px solid var(--accent-border); color: var(--text-secondary); }

/* ===== Settings Overlay ===== */
.settings-overlay {
  position: fixed; z-index: 999; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(2px);
}
.settings-card {
  background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg);
  padding: 24px; width: 320px; box-shadow: var(--shadow-lg);
}
.settings-title { display: block; font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; }
.settings-desc { display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.6; }
.settings-actions { display: flex; gap: 8px; }
.setting-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-color); }
.setting-row:last-of-type { border-bottom: none; }
.setting-label { font-size: 13px; color: var(--text-primary); }

.toggle { width: 42px; height: 24px; border-radius: 12px; background: var(--border-color); position: relative; cursor: pointer; transition: 0.25s; }
.toggle.active { background: var(--accent); }
.toggle-knob { width: 18px; height: 18px; border-radius: 50%; background: #fff; position: absolute; top: 3px; left: 3px; transition: 0.25s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.toggle.active .toggle-knob { left: 21px; }

/* ===== Footer ===== */
.footer { text-align: center; padding: 32px 16px; }
.footer-text { font-size: 11px; color: var(--text-muted); }

/* ===== Responsive: Show right column on wide screens ===== */
@media (min-width: 800px) {
  .col-right { display: flex; flex-direction: column; }
}

/* ===== Dark mode adjustments ===== */
.dark .matrix-cell { background: var(--bg-card); }
.dark .panel-item { background: var(--accent-light); }
.dark .type-preview { background: var(--accent-light); }
.dark .dim-chip { background: var(--accent-light); }
.dark .start-card { background: var(--bg-card); }
</style>
