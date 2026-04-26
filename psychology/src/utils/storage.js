const KEYS = {
  TEST_STATE: 'mbti_test_state',
  SCORES: 'mbti_scores'
}

export function saveTestState(state) {
  try {
    uni.setStorageSync(KEYS.TEST_STATE, state)
  } catch (e) {
    console.warn('saveTestState error:', e)
  }
}

export function loadTestState() {
  try {
    return uni.getStorageSync(KEYS.TEST_STATE) || null
  } catch (e) {
    return null
  }
}

export function clearTestState() {
  try {
    uni.removeStorageSync(KEYS.TEST_STATE)
  } catch (e) {}
}

export function saveScores(scores) {
  try {
    uni.setStorageSync(KEYS.SCORES, scores)
  } catch (e) {}
}

export function loadScores() {
  try {
    return uni.getStorageSync(KEYS.SCORES) || null
  } catch (e) {
    return null
  }
}
