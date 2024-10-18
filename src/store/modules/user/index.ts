import { defineStore } from 'pinia'
import type { UserInfo, UserState } from './helper'
import { defaultSetting, getLocalState, setLocalState } from './helper'
import { fetchUserInfo } from '@/api'

export const useUserStore = defineStore('user-store', {
  state: (): UserState => getLocalState(),
  actions: {
    async getUserInfo() {
      try {
        const { data } = await fetchUserInfo<UserState>()
        this.updateUserInfo(data)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

    updateUserInfo({ userInfo, logined }: { userInfo: Partial<UserInfo>; logined?: Boolean }) {
      this.userInfo = { ...this.userInfo, ...userInfo }
      this.logined = logined || this.logined
      this.recordState()
    },

    resetUserInfo() {
      this.userInfo = { ...defaultSetting().userInfo }
      this.logined = true
      this.recordState()
    },

    recordState() {
      setLocalState(this.$state)
    },
  },
})

export function useUserStoreWithout() {
  return useUserStore()
}
