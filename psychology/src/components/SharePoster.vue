<template>
  <view class="share-poster" v-if="visible" @click="onClose">
    <view class="poster-overlay"></view>
    <view class="poster-wrapper">
      <canvas class="poster-canvas" canvas-id="posterCanvas" id="posterCanvas" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"></canvas>
      <view class="poster-actions">
        <view class="action-btn save" @click.stop="onSave">保存海报</view>
        <view class="action-btn close" @click.stop="onClose">关闭</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { generateQRDataURL } from '../utils/qrcode'

const props = defineProps({
  visible: Boolean,
  type: String,
  subtitle: String,
  details: Array,
  reliability: { type: Number, default: 80 },
  keywords: { type: Array, default: () => [] },
  quote: { type: String, default: '' }
})
const emit = defineEmits(['close'])

const canvasWidth = ref(360)
const canvasHeight = ref(640)

function onClose() { emit('close') }

function drawTag(ctx, text, x, y, color) {
  const tw = text.length * 14 + 20
  ctx.setFillStyle('rgba(255,255,255,0.12)')
  ctx.fillRect(x, y - 9, tw, 24)
  // Rounded effect with small rect
  ctx.setFillStyle('rgba(255,255,255,0.08)')
  ctx.fillRect(x + 2, y - 7, tw - 4, 20)

  ctx.setFillStyle('rgba(255,255,255,0.85)')
  ctx.setFontSize(12)
  ctx.setTextAlign('center')
  ctx.fillText(text, x + tw / 2, y + 6)
  return tw + 6
}

function drawProgressBar(ctx, barX, y, barW, barH, pct, color) {
  // Track
  ctx.setFillStyle('rgba(255,255,255,0.08)')
  ctx.fillRect(barX, y, barW, barH)
  // Fill
  const fillW = Math.max(2, (pct / 100) * barW)
  ctx.setFillStyle(color)
  ctx.fillRect(barX, y, fillW, barH)
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + r, r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

watch(() => props.visible, async (val) => {
  if (!val || !props.type) return

  await new Promise(r => setTimeout(r, 400))

  const ctx = uni.createCanvasContext('posterCanvas')
  const W = canvasWidth.value
  const H = canvasHeight.value

  // Background
  ctx.setFillStyle('#1a1a2e')
  ctx.fillRect(0, 0, W, H)

  // Top accent bar
  ctx.setFillStyle('#667eea')
  ctx.fillRect(0, 36, W, 4)

  // Personality type
  ctx.setTextAlign('center')
  ctx.setFillStyle('#ffffff')
  ctx.setFontSize(60)
  ctx.fillText(props.type, W / 2, 120)

  // Subtitle
  ctx.setFontSize(18)
  ctx.setFillStyle('rgba(255,255,255,0.8)')
  ctx.fillText(props.subtitle, W / 2, 155)

  // Quote
  if (props.quote) {
    ctx.setFontSize(13)
    ctx.setFillStyle('rgba(255,255,255,0.45)')
    ctx.fillText('"' + props.quote + '"', W / 2, 188)
  }

  // Keywords
  const kws = props.keywords.slice(0, 5)
  if (kws.length > 0) {
    let kx = 40
    let ky = 228
    kws.forEach(kw => {
      const spacing = drawTag(ctx, kw, kx, ky, '#667eea')
      kx += spacing
      if (kx > W - 60) { kx = 40; ky += 30 }
    })
  }

  // Dimension bars
  const dimStartY = 275
  const barW = 200
  const barH = 12
  const barX = (W - barW) / 2

  ctx.setFontSize(16)
  props.details.forEach((d, i) => {
    const y = dimStartY + i * 48

    // Left label
    ctx.setTextAlign('right')
    ctx.setFillStyle('#667eea')
    ctx.fillText(d.left.label, barX - 12, y + 10)

    // Right label
    ctx.setTextAlign('left')
    ctx.setFillStyle('#764ba2')
    ctx.fillText(d.right.label, barX + barW + 12, y + 10)

    // Left fill
    drawProgressBar(ctx, barX, y, barW / 2, barH, d.left.pct, '#667eea')
    // Right fill
    drawProgressBar(ctx, barX + barW / 2, y, barW / 2, barH, d.right.pct, '#764ba2')

    // Divider
    ctx.setFillStyle('rgba(255,255,255,0.2)')
    ctx.fillRect(barX + barW / 2 - 1, y - 2, 2, barH + 4)

    // Percentages
    ctx.setFontSize(10)
    ctx.setTextAlign('center')
    ctx.setFillStyle('rgba(255,255,255,0.6)')
    ctx.fillText(d.left.pct + '%', barX + (barW / 2) * (d.left.pct / 100) / 2, y + barH + 14)
    ctx.fillText(d.right.pct + '%', barX + barW - (barW / 2) * (d.right.pct / 100) / 2, y + barH + 14)
    ctx.setFontSize(16)
  })

  // Reliability
  ctx.setFontSize(12)
  ctx.setFillStyle('rgba(255,255,255,0.4)')
  ctx.setTextAlign('center')
  const relY = dimStartY + props.details.length * 48 + 16
  ctx.fillText('测算可靠度: ' + props.reliability + '%', W / 2, relY)

  // QR Code
  const qrSize = 80
  const qrX = (W - qrSize) / 2
  const qrY = relY + 20

  try {
    const qrDataUrl = await generateQRDataURL('https://iostar.space', qrSize)
    ctx.drawImage(qrDataUrl, qrX, qrY, qrSize, qrSize)
  } catch (e) {
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(qrX, qrY, qrSize, qrSize)
    ctx.setFillStyle('#1a1a2e')
    ctx.setFontSize(24)
    ctx.setTextAlign('center')
    ctx.fillText('QR', W / 2, qrY + qrSize / 2 + 8)
  }

  // Brand
  ctx.setFillStyle('rgba(255,255,255,0.25)')
  ctx.setFontSize(10)
  ctx.fillText('扫码查看完整报告', W / 2, qrY + qrSize + 22)
  ctx.fillText('PsyTools · iostar.space', W / 2, qrY + qrSize + 38)

  ctx.draw()
})

function onSave() {
  uni.showLoading({ title: '生成中...' })
  setTimeout(() => {
    uni.canvasToTempFilePath({
      canvasId: 'posterCanvas',
      fileType: 'png',
      quality: 1,
      success: (res) => {
        uni.hideLoading()
        const link = document.createElement('a')
        link.download = 'MBTI-' + props.type + '.png'
        link.href = res.tempFilePath
        link.click()
        uni.showToast({ title: '已保存', icon: 'success' })
      },
      fail: () => {
        uni.hideLoading()
        uni.showToast({ title: '生成失败', icon: 'none' })
      }
    })
  }, 600)
}
</script>

<style scoped>
.share-poster {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 999;
  display: flex; align-items: center; justify-content: center; flex-direction: column;
}
.poster-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); }
.poster-wrapper { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; }
.poster-canvas { border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); width: 360px; height: 640px; }
.poster-actions { display: flex; gap: 16px; margin-top: 16px; }
.action-btn { padding: 10px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; }
.action-btn.save { background: #667eea; color: #fff; }
.action-btn.close { background: rgba(255,255,255,0.15); color: #fff; }
</style>
