import { defineStore } from 'pinia'
import { usePermissionStore, useRouterStore, useTabStore, useUserStore } from '@/store'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: undefined,
    refreshToken: undefined,
    isRefreshing: false, // 是否正在刷新 token
    refreshSubscribers: [] // 等待 token 刷新完成的订阅者
  }),
  actions: {
    setToken({ accessToken, refreshToken }) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
    },
    resetToken() {
      this.$reset()
    },
    // 添加订阅者，等待 token 刷新完成
    addRefreshSubscriber(callback) {
      this.refreshSubscribers.push(callback)
    },
    // 通知所有订阅者 token 已刷新
    onRefreshed(accessToken) {
      this.refreshSubscribers.forEach((callback) => callback(accessToken))
      this.refreshSubscribers = []
    },
    toLogin() {
      const { router, route } = useRouterStore()
      router.replace({
        path: '/login',
        query: route.query
      })
    },
    async switchCurrentRole(data) {
      this.resetLoginState()
      await nextTick()
      this.setToken(data)
    },
    resetLoginState() {
      const { resetUser } = useUserStore()
      const { resetRouter } = useRouterStore()
      const { resetPermission, accessRoutes } = usePermissionStore()
      const { resetTabs } = useTabStore()
      // 重置路由
      resetRouter(accessRoutes)
      // 重置用户
      resetUser()
      // 重置权限
      resetPermission()
      // 重置Tabs
      resetTabs()
      // 重置token
      this.resetToken()
    },
    async logout() {
      this.resetLoginState()
      this.toLogin()
    }
  },
  persist: {
    key: 'vue-naivue-admin_auth'
  }
})
