import { defineStore } from 'pinia'

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
      const url = this.userInfo?.avatar
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
