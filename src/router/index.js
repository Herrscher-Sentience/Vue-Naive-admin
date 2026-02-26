import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { useAuthStore, usePermissionStore, useTabStore, useUserStore } from '@/store'
import { getUserInfo, getUserPermission } from '@/store/helper'

const WHITE_LIST = ['/login', '/404']
const EXCLUDE_TAB = ['/404', '/403', '/login']
const baseTitle = import.meta.env.VITE_TITLE

// ========== 基础路由 ==========
export const basicRoutes = [
  {
    name: 'Login',
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录页', layout: 'empty' }
  },
  {
    name: 'Home',
    path: '/',
    component: () => import('@/views/home/index.vue'),
    meta: { title: '首页' }
  },
  {
    name: '404',
    path: '/404',
    component: () => import('@/views/error-page/404.vue'),
    meta: { title: '页面飞走了', layout: 'empty' }
  },
  {
    name: '403',
    path: '/403',
    component: () => import('@/views/error-page/403.vue'),
    meta: { title: '没有权限', layout: 'empty' }
  }
]

// 后端菜单 → Vue Router 路由
const transformMenusToRoutes = (menus, viewModules) => {
  const routes = []

  menus.forEach((menu) => {
    if (menu.enable === false || menu.show === false)
      return

    // 解析路由参数
    let defaultQuery = {}
    if (menu.query) {
      try {
        defaultQuery = typeof menu.query === 'string' ? JSON.parse(menu.query) : menu.query
      }
      catch (e) {
        console.warn('[router] 解析路由参数失败:', menu.query, 'menu:', menu.name, e)
      }
    }

    let route = null
    const isExternalLink = menu.path?.startsWith('http://') || menu.path?.startsWith('https://')
    const isTemplateComponent = menu.component?.includes('{{') || menu.component?.includes('${')
    const iframeComponent = viewModules['/src/views/iframe/index.vue']

    // 处理外链菜单和特殊 component（使用 iframe）
    if (isExternalLink || isTemplateComponent) {
      route = {
        path: `/iframe/${menu.code}`,
        name: menu.code,
        component: iframeComponent,
        meta: {
          title: menu.name,
          icon: menu.icon,
          originPath: menu.path,
          keepAlive: false,
          defaultQuery
        }
      }
    }
    // 处理普通组件菜单
    else if (menu.component) {
      let componentPath = menu.component
      if (!componentPath.startsWith('/src/'))
        componentPath = `/src/${componentPath}`
      if (!componentPath.endsWith('.vue'))
        componentPath = `${componentPath}.vue`

      const component = viewModules[componentPath]
      if (component) {
        let routePath = menu.path || `/${menu.name}`
        if (!routePath.startsWith('/'))
          routePath = `/${routePath}`

        route = {
          path: routePath,
          name: String(menu.code || menu.name || menu.id),
          component,
          meta: {
            title: menu.name,
            icon: menu.icon,
            keepAlive: !!menu.keepAlive,
            defaultQuery
          }
        }
      }
      else {
        console.warn('[router] component not found:', componentPath, 'menu:', menu.name)
      }
    }

    if (route) {
      if (menu.children?.length)
        route.children = transformMenusToRoutes(menu.children, viewModules)
      routes.push(route)
    }
    else if (menu.children?.length) {
      routes.push(...transformMenusToRoutes(menu.children, viewModules))
    }
  })

  return routes
}

// 页面加载守卫
const createPageLoadingGuard = (router) => {
  router.beforeEach(() => $loadingBar.start())
  router.afterEach(() => setTimeout(() => $loadingBar.finish(), 200))
  router.onError(() => $loadingBar.error())
}

// 页面标题守卫
const createPageTitleGuard = (router) => {
  router.afterEach((to) => {
    document.title = to.meta?.title ? `${to.meta.title} | ${baseTitle}` : baseTitle
  })
}

// Tab 守卫
const createTabGuard = (router) => {
  router.afterEach((to) => {
    if (EXCLUDE_TAB.includes(to.path))
      return
    const tabStore = useTabStore()
    const { name, fullPath: path, meta } = to
    tabStore.addTab({ name, path, title: meta?.title, icon: meta?.icon, keepAlive: meta?.keepAlive })
  })
}

// 权限守卫
const createPermissionGuard = (router) => {
  const viewModules = import.meta.glob('/src/**/*.vue')

  router.beforeEach(async (to) => {
    const authStore = useAuthStore()
    const token = authStore.accessToken

    // 处理默认路由参数
    const defaultQuery = to.meta?.defaultQuery
    if (defaultQuery && Object.keys(defaultQuery).length > 0) {
      const hasChanges = Object.keys(defaultQuery).some((key) => to.query[key] === undefined)
      if (hasChanges)
        return { path: to.path, query: { ...defaultQuery, ...to.query }, replace: true }
    }

    // 未登录
    if (!token) {
      if (WHITE_LIST.includes(to.path))
        return true
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    // 已登录访问登录页
    if (to.path === '/login')
      return { path: '/' }

    if (WHITE_LIST.includes(to.path))
      return true

    const userStore = useUserStore()
    const permissionStore = usePermissionStore()

    // 初始化用户 & 动态路由
    if (!userStore.userInfo) {
      const [user, menus] = await Promise.all([getUserInfo(), getUserPermission()])
      userStore.setUser(user)
      permissionStore.setPermissions(menus)

      const accessRoutes = transformMenusToRoutes(menus, viewModules)
      accessRoutes.forEach((route) => {
        if (!router.hasRoute(route.name))
          router.addRoute(route)
      })

      return { ...to, replace: true }
    }

    // 路由存在
    if (router.hasRoute(to.name))
      return true

    // 404
    return { path: '/404', query: { path: to.fullPath } }
  })
}

// 设置所有路由守卫
export const setupRouterGuards = (router) => {
  createPageLoadingGuard(router)
  createPermissionGuard(router)
  createPageTitleGuard(router)
  createTabGuard(router)
}

export const router = createRouter({
  history:
    import.meta.env.VITE_USE_HASH === 'true'
      ? createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH || '/')
      : createWebHistory(import.meta.env.VITE_PUBLIC_PATH || '/'),
  routes: basicRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export async function setupRouter(app) {
  app.use(router)
  setupRouterGuards(router)
}
