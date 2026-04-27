# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Soultools —— 中文 MBTI 在线心理测评工具站，基于 uni-app (Vue 3) 跨端框架开发，支持 H5/微信小程序等多端发布。

## 开发命令

```bash
# H5 开发
cd psychology && npm run dev:h5

# H5 构建
cd psychology && npm run build:h5

# 安装依赖
cd psychology && npm install

# 抓取 MBTI 题库（从 GitHub 源拉取 93 题并转换格式）
node scripts/fetch-mbti-questions.js

# 增强人格数据（合并职业/优劣势数据到 personality-types.json）
node psychology/src/utils/enhancePersonality.js
```

## 部署

- 通过 Vercel 部署，输出目录: `dist/build/h5`
- `vercel.json` 配置了 SPA fallback 路由和缓存策略

## 技术栈

- **框架**: uni-app 3.0 (Vue 3 + Vite)
- **状态管理**: Pinia
- **构建**: @dcloudio/vite-plugin-uni
- **部署**: Vercel (SPA)
- **无测试框架**

## 架构

### 页面路由 (pages.json)

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | `/` | 品牌展示 + 16 人格矩阵 + 进度面板 + 热门排行 |
| 测试 | `/pages/test/mbti` | 93 题 MBTI 测试（滑动/点击作答） |
| 结果 | `/pages/result/mbti` | 维度倾向图表 + 性格画像/职场天赋/盲点建议/可靠度 |

### Pinia Stores

- **store/test.js**: 核心测试逻辑 —— 题目列表、答题、计分 (E/I/S/N/T/F/J/P)、结果计算（含 tie 检测）、本地持久化
- **store/settings.js**: 深色模式开关、设置面板显隐

### 组件

- `QuestionCard.vue` — 题目卡片（单选 + 左右滑动手势）
- `ProgressBar.vue` — 进度条（含 25/50/75 里程碑标记）
- `DimensionBar.vue` — 单维度倾向条（左/右百分比）
- `PersonalityTabs.vue` — 人格类型 tab 切换展示
- `SharePoster.vue` — Canvas 生成分享海报（类型 + 维度 + QR 码）

### 工具模块

- `utils/storage.js` — uni-app 存储封装
- `utils/keywords.js` — 16 种人格关键词 & 灵魂语录
- `utils/qrcode.js` — QR 码生成
- `utils/enhancePersonality.js` — 独立脚本，往 `personality-types.json` 写入职业/优劣势数据

### 数据

- `mbti_questions.json` / `src/static/questions.json` — 93 道 MBTI 题目（二维数组：text + 选项 + 维度映射）
- `mbti_personality_types.json` / `src/static/personality-types.json` — 16 种人格详情（描述、画像、职业、优劣势）

### 样式

- `App.vue` 定义 CSS Custom Properties 实现完整 light/dark 主题
- 全局绿色调性：`--accent: #16a34a` / `--accent-gradient: linear-gradient(135deg, #16a34a 0%, #059669 100%)`

### 答题流程

1. 首页开始/继续 → 跳转测试页
2. 每题选择 A/B 选项 → 更新 Pinia scores → 自动保存到 uni-app Storage
3. 最后一道题答完自动计算 → 跳转结果页
4. 结果页: 四维度倾向分析 + 强度等级 (轻微/中等/极强) + tie 检测 (差值 <= 10%) + 可靠度计算
5. 结果页可生成分享海报 (Canvas 绘制)
