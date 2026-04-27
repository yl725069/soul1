<template>
  <TestEngine
    questionsUrl="/static/questions-mbti-16.json"
    :config="{
      testId: 'mbti16',
      minConsistency: 14,
      testPage: '/pages/test/mbti16',
      resultPage: '/pages/result/mbti',
      testLabel: 'MBTI 简易版'
    }"
  />
</template>

<script setup>
import TestEngine from '../../components/TestEngine.vue'
</script>
