import { defineStore } from 'pinia'
import { resolveAssetUrl } from '@/utils/index.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null
  }),
  getters: {
    userId() {
      return this.userInfo?.id
    },
    userName() {
      return this.userInfo?.userName
    },
    nickName() {
      return this.userInfo?.nickName
    },
    avatar() {
      return resolveAssetUrl(this.userInfo?.avatar)
    },
    currentRole() {
      return this.userInfo?.currentRole || {}
    },
    roles() {
      return this.userInfo?.roles || []
    }
  },
  actions: {
    setUser(user) {
      this.userInfo = user
    },
    resetUser() {
      this.$reset()
    }
  }
})
