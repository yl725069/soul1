import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const darkMode = ref(false)
  const showSettings = ref(false)

  function load() {
    try {
      const saved = uni.getStorageSync('app_settings')
      if (saved) darkMode.value = saved.darkMode || false
    } catch (e) {}
    applyTheme()
  }

  function toggleDark() {
    darkMode.value = !darkMode.value
    applyTheme()
    persist()
  }

  function applyTheme() {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', darkMode.value)
    }
  }

  function persist() {
    try {
      uni.setStorageSync('app_settings', { darkMode: darkMode.value })
    } catch (e) {}
  }

  return { darkMode, showSettings, load, toggleDark }
})
