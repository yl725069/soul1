import { defineStore } from 'pinia'
import { saveTestState, loadTestState, clearTestState, saveScores, loadScores } from '../utils/storage'

export const useTestStore = defineStore('test', {
  state: () => ({
    questions: [],
    currentIndex: 0,
    answers: [],        // [{ questionId, dimension, value }]
    scores: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 },
    isCompleted: false,
    result: null        // { type: 'INFP', subtitle: '...', ... }
  }),

  getters: {
    currentQuestion: (state) => state.questions[state.currentIndex] || null,
    totalQuestions: (state) => state.questions.length,
    progress: (state) => state.questions.length > 0
      ? Math.round((state.currentIndex / state.questions.length) * 100) : 0,
    isFirstQuestion: (state) => state.currentIndex === 0,
    isLastQuestion: (state) => state.currentIndex >= state.questions.length - 1,
    hasAnswered: (state) => (index) => {
      return state.answers.some(a => a.questionId === index)
    },
    getAnswer: (state) => (index) => {
      return state.answers.find(a => a.questionId === index)
    }
  },

  actions: {
    initTest(questions) {
      this.questions = questions
      const saved = loadTestState()
      if (saved && saved.questions === questions.length) {
        this.currentIndex = saved.currentIndex || 0
        this.answers = saved.answers || []
        this.scores = saved.scores || { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
        this.isCompleted = saved.isCompleted || false
      } else {
        this.resetTest()
        this.questions = questions
      }
    },

    answerQuestion(questionId, scoreKey) {
      const existing = this.answers.findIndex(a => a.questionId === questionId)
      if (existing >= 0) {
        const oldKey = this.answers[existing].dimension
        this.scores[oldKey] = Math.max(0, this.scores[oldKey] - 1)
        this.answers.splice(existing, 1)
      }
      this.answers.push({ questionId, dimension: scoreKey, value: 1 })
      this.scores[scoreKey] += 1
      this._persist()
    },

    goNext() {
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++
        this._persist()
      }
    },

    goPrev() {
      if (this.currentIndex > 0) {
        this.currentIndex--
        this._persist()
      }
    },

    goTo(index) {
      if (index >= 0 && index < this.questions.length) {
        this.currentIndex = index
      }
    },

    calculateResult(personalityTypes) {
      const dims = [
        { a: 'E', b: 'I', tie: 'I' },
        { a: 'S', b: 'N', tie: 'N' },
        { a: 'T', b: 'F', tie: 'F' },
        { a: 'J', b: 'P', tie: 'P' }
      ]
      let typeCode = ''
      const details = []
      const ties = []

      dims.forEach(({ a, b, tie }) => {
        const scoreA = this.scores[a] || 0
        const scoreB = this.scores[b] || 0
        const total = scoreA + scoreB
        const pctA = total > 0 ? (scoreA / total) * 100 : 50
        const pctB = total > 0 ? (scoreB / total) * 100 : 50
        const diff = Math.abs(pctA - pctB)

        let winner = scoreA > scoreB ? a : (scoreB > scoreA ? b : tie)

        // Detect tie (within 10% threshold)
        const isTie = diff <= 10
        if (isTie) {
          ties.push({ dim: a + '/' + b, a, b, pctA: Math.round(pctA), pctB: Math.round(pctB) })
        }

        typeCode += winner

        // Determine strength label
        const getStrength = (pct) => {
          if (pct >= 65) return { label: '极强', level: 3 }
          if (pct >= 58) return { label: '中等', level: 2 }
          return { label: '轻微', level: 1 }
        }

        details.push({
          dimension: a + '/' + b,
          left: { label: a, score: scoreA, pct: Math.round(pctA), strength: getStrength(pctA) },
          right: { label: b, score: scoreB, pct: Math.round(pctB), strength: getStrength(pctB) },
          winner,
          isTie,
          diff: Math.round(diff)
        })
      })

      // Calculate reliability based on answer consistency and completion
      const answerCount = this.answers.length
      const maxQuestions = this.questions.length
      const completionRate = maxQuestions > 0 ? answerCount / maxQuestions : 0
      const hasConsistency = answerCount >= 60
      let reliability = 0
      if (completionRate >= 0.95 && hasConsistency) reliability = 95
      else if (completionRate >= 0.8) reliability = 85
      else if (completionRate >= 0.5) reliability = 70
      else reliability = 50

      const typeData = personalityTypes.find(p => p.type === typeCode) || {}
      this.result = {
        type: typeCode,
        subtitle: typeData.subtitle || '',
        details,
        ties,
        reliability,
        description: typeData.description || '',
        portrait: typeData.portrait || '',
        career: typeData.career || [],
        strengths: typeData.strengths || [],
        weaknesses: typeData.weaknesses || []
      }
      this.isCompleted = true
      saveScores(this.scores)
      this._persist()
      return this.result
    },

    resetTest() {
      this.currentIndex = 0
      this.answers = []
      this.scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
      this.isCompleted = false
      this.result = null
      clearTestState()
    },

    _persist() {
      saveTestState({
        questions: this.questions.length,
        currentIndex: this.currentIndex,
        answers: this.answers,
        scores: this.scores,
        isCompleted: this.isCompleted,
        lastTime: Date.now()
      })
    }
  }
})
