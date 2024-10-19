import { defineStore } from 'pinia'
import type { UserInfo, UserState } from './helper'
import { defaultSetting, getLocalState, setLocalState } from './helper'
import { modifyPwd, userLogin, userRegister } from '@/api'

export const useUserStore = defineStore('user-store', {
  state: (): UserState => getLocalState(),
  actions: {

    updateUserInfo(userInfo: Partial<UserInfo>) {
      this.userInfo = { ...this.userInfo, ...userInfo }
      this.recordState()
    },

    resetUserInfo() {
      this.userInfo = { ...defaultSetting().userInfo }
      this.recordState()
    },

    recordState() {
      setLocalState(this.$state)
    },

    async login(params: any) {
      const res = await userLogin<any>(params)

      return res
    },

    async register(params: any) {
      const res = await userRegister<any>(params)
      return res
    },

    async modifyPwd(params: any) {
      const res = await modifyPwd<any>(params)
      return res
    },
  },
})

export function useUserStoreWithout() {
  return useUserStore()
}
