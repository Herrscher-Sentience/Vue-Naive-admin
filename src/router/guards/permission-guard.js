import { useAuthStore, usePermissionStore, useUserStore } from '@/store'
import { getUserInfo, getUserPermission } from '@/store/helper'

const WHITE_LIST = ['/login', '/404']

/**
 * 创建路由权限守卫
 * @param {import('vue-router').Router} router
 */
export function createPermissionGuard(router) {
  const routeComponents = import.meta.glob('/src/views/**/*.vue')

  router.beforeEach(async (to) => {
    const authStore = useAuthStore()
    const token = authStore.accessToken

    /* ---------- 未登录 ---------- */
    if (!token) {
      if (WHITE_LIST.includes(to.path))
        return true

      return {
        path: '/login',
        query: { redirect: to.fullPath }
      }
    }

    /* ---------- 已登录访问登录页 ---------- */
    if (to.path === '/login')
      return { path: '/' }

    if (WHITE_LIST.includes(to.path))
      return true

    const userStore = useUserStore()
    const permissionStore = usePermissionStore()

    /* ---------- 初始化用户 & 权限 & 动态路由（只执行一次） ---------- */
    if (!userStore.userInfo) {
      const [user, menus] = await Promise.all([
        getUserInfo(),
        getUserPermission()
      ])

      userStore.setUser(user)
      permissionStore.setPermissions(menus)

      permissionStore.accessRoutes.forEach((route) => {
        // 防止重复注册
        if (router.hasRoute(route.name))
          return

        const component = routeComponents[route.component]
        if (!component) {
          // 组件路径不合法，直接跳过
          console.warn(
            `[permission] Component not found: ${route.component}`
          )
          return
        }

        router.addRoute({
          ...route,
          component
        })
      })

      // 重新进入当前路由，触发刚注册的动态路由
      return { ...to, replace: true }
    }

    /* ---------- 路由存在性校验 ---------- */
    if (router.hasRoute(to.name))
      return true

    /* ---------- 兜底 404 ---------- */
    return {
      name: '404',
      query: { path: to.fullPath }
    }
  })
}
