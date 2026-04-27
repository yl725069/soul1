export const TEST_STORAGE_PREFIX = 'mbti_test_'

function storageKey(suffix) {
  return TEST_STORAGE_PREFIX + (suffix || 'state')
}

export function saveTestState(state, suffix) {
  try {
    uni.setStorageSync(storageKey(suffix), state)
  } catch (e) {
    console.warn('saveTestState error:', e)
  }
}

export function loadTestState(suffix) {
  try {
    return uni.getStorageSync(storageKey(suffix)) || null
  } catch (e) {
    return null
  }
}

export function clearTestState(suffix) {
  try {
    uni.removeStorageSync(storageKey(suffix))
  } catch (e) {}
}
