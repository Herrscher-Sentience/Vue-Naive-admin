import { useAuthStore, usePermissionStore, useUserStore } from '@/store'
import { getUserInfo, getUserPermission } from '@/store/helper'

const WHITE_LIST = ['/login', '/404']
export function createPermissionGuard(router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()
    const token = authStore.accessToken

    /** 没有token */
    if (!token) {
      if (WHITE_LIST.includes(to.path))
        return true
      return { path: 'login', query: { ...to.query, redirect: to.path } }
    }

    // 有token的情况
    if (to.path === '/login')
      return { path: '/' }
    if (WHITE_LIST.includes(to.path))
      return true

    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    if (!userStore.userInfo) {
      const [user, menus] = await Promise.all([getUserInfo(), getUserPermission()])

      userStore.setUser(user)
      permissionStore.setPermissions(menus)
      const routeComponents = import.meta.glob('@/views/**/*.vue')
      permissionStore.accessRoutes.forEach((route) => {
        const componentKey = route.component
        if (componentKey && routeComponents[componentKey]) {
          route.component = routeComponents[componentKey]
        }
        else if (componentKey) {
          // 尝试其他可能的路径格式
          const alternativePaths = [
            componentKey,
            componentKey.replace('@/views/', '/src/views/'),
            componentKey.replace('@/', '/src/')
          ]
          for (const path of alternativePaths) {
            if (routeComponents[path]) {
              route.component = routeComponents[path]
              break
            }
          }
          if (!route.component || typeof route.component !== 'function') {
            // console.warn(`Component not found for route ${route.name} with component path: ${componentKey}`)
          }
        }
        if (route.component && typeof route.component === 'function') {
          !router.hasRoute(route.name) && router.addRoute(route)
        }
        else {
          // console.warn(`Skipping route ${route.name} due to missing or invalid component`)
        }
      })
      return { ...to, replace: true }
    }

    const routes = router.getRoutes()

    if (routes.find((route) => route.name === to.name)) {
      return true
    }

    // 路由不存在，返回 404
    return { name: '404', query: { path: to.fullPath } }
  })
}
