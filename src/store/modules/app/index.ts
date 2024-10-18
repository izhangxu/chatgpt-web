import { defineStore } from 'pinia'
import type { AppState, Language } from './helper'
import { getLocalSetting, setLocalSetting } from './helper'
import { store } from '@/store/helper'

export const useAppStore = defineStore('app-store', {
  state: (): AppState => getLocalSetting(),
  actions: {
    setSiderCollapsed(collapsed: Boolean) {
      this.siderCollapsed = collapsed
      this.recordState()
    },

    setLanguage(language: Language) {
      if (this.language !== language) {
        this.language = language
        this.recordState()
      }
    },

    recordState() {
      setLocalSetting(this.$state)
    },
  },
})

export function useAppStoreWithOut() {
  return useAppStore(store)
}
