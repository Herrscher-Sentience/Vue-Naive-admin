import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null
  }),
  getters: {
    userId() {
      return this.userInfo?.id
    },
    username() {
      return this.userInfo?.username
    },
    realName() {
      return this.userInfo?.realName
    },
    headUrl() {
      const url = this.userInfo?.headUrl
      if (!url)
        return ''
      // 如果已经是完整 URL，直接返回
      if (url.startsWith('http://') || url.startsWith('https://'))
        return url
      // 否则拼接后端域名
      return `${import.meta.env.VITE_PROXY_TARGET}${url}`
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
