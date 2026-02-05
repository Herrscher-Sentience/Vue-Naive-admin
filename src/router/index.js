import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { useAuthStore, usePermissionStore, useTabStore, useUserStore } from '@/store'
import { getUserInfo, getUserPermission } from '@/store/helper'

// ========== 基础路由 ==========
export const basicRoutes = [
  {
    name: 'Login',
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录页',
      layout: 'empty'
    }
  },
  {
    name: 'Home',
    path: '/',
    component: () => import('@/views/home/index.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    name: '404',
    path: '/404',
    component: () => import('@/views/error-page/404.vue'),
    meta: {
      title: '页面飞走了',
      layout: 'empty'
    }
  },
  {
    name: '403',
    path: '/403',
    component: () => import('@/views/error-page/403.vue'),
    meta: {
      title: '没有权限',
      layout: 'empty'
    }
  }
]

// ========== 路由守卫配置 ==========
const WHITE_LIST = ['/login', '/404']
const EXCLUDE_TAB = ['/404', '/403', '/login']
const baseTitle = import.meta.env.VITE_TITLE

/**
 * 后端菜单 → Vue Router 路由
 * @param {Array} menus 后端返回的菜单树
 * @param {object} viewModules import.meta.glob 的结果
 */
const transformMenusToRoutes = (menus, viewModules) => {
  const routes = []

  menus.forEach((menu) => {
    // 处理外链菜单（以 http 或 https 开头的路径）
    if (menu.path && (menu.path.startsWith('http://') || menu.path.startsWith('https://'))) {
      const route = {
        path: `/iframe/${menu.code}`,
        name: menu.code,
        component: viewModules['/src/views/iframe/index.vue'],
        meta: {
          title: menu.name,
          icon: menu.icon,
          originPath: menu.path,
          keepAlive: false
        }
      }
      routes.push(route)
      return
    }

    // 没有组件的，直接跳过（按钮权限）
    if (!menu.component)
      return

    // 处理特殊的 component 路径（包含模板字符串的路径，如 {{ window._CONFIG['domianURL'] }}）
    if (menu.component.includes('{{') || menu.component.includes('${')) {
      // 这些菜单使用 iframe 显示外部链接
      const route = {
        path: `/iframe/${menu.code}`,
        name: menu.code,
        component: viewModules['/src/views/iframe/index.vue'],
        meta: {
          title: menu.name,
          icon: menu.icon,
          originPath: menu.path,
          keepAlive: false
        }
      }
      routes.push(route)
      return
    }

    // 处理 component 路径
    let componentPath = menu.component
    // 如果不是完整路径，添加 /src/ 前缀
    if (!componentPath.startsWith('/src/')) {
      componentPath = `/src/${componentPath}`
    }
    // 如果没有 .vue 后缀，添加
    if (!componentPath.endsWith('.vue')) {
      componentPath = `${componentPath}.vue`
    }

    const component = viewModules[componentPath]

    if (!component) {
      console.warn('[router] component not found:', componentPath, 'menu:', menu.name)
      return
    }

    const route = {
      path: menu.path || `/${menu.name}`,
      name: menu.code || menu.name || menu.id,
      component,
      meta: {
        title: menu.name,
        icon: menu.icon,
        keepAlive: !!menu.keepAlive
      }
    }

    // 递归处理子菜单
    if (menu.children && menu.children.length) {
      route.children = transformMenusToRoutes(menu.children, viewModules)
    }

    routes.push(route)
  })

  return routes
}

/**
 * 页面加载守卫
 */
const createPageLoadingGuard = (router) => {
  router.beforeEach(() => {
    $loadingBar.start()
  })

  router.afterEach(() => {
    setTimeout(() => {
      $loadingBar.finish()
    }, 200)
  })

  router.onError(() => {
    $loadingBar.error()
  })
}

/**
 * 页面标题守卫
 */
const createPageTitleGuard = (router) => {
  router.afterEach((to) => {
    const pageTitle = to.meta?.title
    if (pageTitle) {
      document.title = `${pageTitle} | ${baseTitle}`
    }
    else {
      document.title = baseTitle
    }
  })
}

/**
 * Tab 守卫
 */
const createTabGuard = (router) => {
  router.afterEach((to) => {
    if (EXCLUDE_TAB.includes(to.path))
      return
    const tabStore = useTabStore()
    const { name, fullPath: path } = to
    const title = to.meta?.title
    const icon = to.meta?.icon
    const keepAlive = to.meta?.keepAlive
    tabStore.addTab({ name, path, title, icon, keepAlive })
  })
}

/**
 * 权限守卫
 */
const createPermissionGuard = (router) => {
  // 懒加载所有页面组件
  const viewModules = import.meta.glob('/src/**/*.vue')

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

    /* ---------- 初始化用户 & 动态路由（只执行一次） ---------- */
    if (!userStore.userInfo) {
      const [user, menus] = await Promise.all([
        getUserInfo(),
        getUserPermission()
      ])

      userStore.setUser(user)

      // 菜单 → 路由
      const accessRoutes = transformMenusToRoutes(menus, viewModules)
      // 设置菜单数据（原始菜单数据，用于侧边栏显示）
      permissionStore.setPermissions(menus)

      // 注册动态路由
      accessRoutes.forEach((route) => {
        if (!router.hasRoute(route.name))
          router.addRoute(route)
      })

      // 重新进入，确保命中动态路由
      return { ...to, replace: true }
    }

    /* ---------- 路由存在 ---------- */
    if (router.hasRoute(to.name))
      return true

    /* ---------- 404 ---------- */
    return {
      path: '/404',
      query: { path: to.fullPath }
    }
  })
}

/**
 * 设置所有路由守卫
 */
export const setupRouterGuards = (router) => {
  createPageLoadingGuard(router)
  createPermissionGuard(router)
  createPageTitleGuard(router)
  createTabGuard(router)
}

// ========== 创建路由实例 ==========
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
