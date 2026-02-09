import { defineStore } from 'pinia'
import { h } from 'vue'
import { isExternal } from '@/utils'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    accessRoutes: [],
    permissions: [],
    menus: []
  }),
  actions: {
    setPermissions(permissions) {
      this.permissions = permissions
      // 获取所有顶级菜单项（parentId === 0 或没有 parentId 字段），包括 DIRECTORY 和 MENU 类型
      const topMenuItems = this.permissions.filter((item) => (item.parentId === 0 || item.parentId === undefined || item.parentId === null) && item.show)
      this.menus = topMenuItems
        .map((item) => this.getMenuItem(item))
        .filter((item) => !!item)
        .sort((a, b) => a.order - b.order)

      // 添加首页菜单到菜单数组开头
      const homeMenuItem = {
        label: '首页',
        key: 'Home',
        path: '/',
        icon: () => h('i', { class: 'i-fe:home text-16' }),
        order: -1 // 确保排在最前面
      }
      this.menus.unshift(homeMenuItem)
    },
    getMenuItem(item, parent) {
      const route = this.generateRoute(item, parent?.key)
      if (route.path) {
        this.accessRoutes.push(route)
      }
      const menuItem = {
        label: route.meta.title,
        key: route.name,
        path: route.path,
        originPath: route.meta.originPath,
        icon: () => h('i', { class: `${route.meta.icon} text-16` }),
        order: item.order ?? 0
      }
      // 递归处理子菜单，包括 DIRECTORY 和 MENU 类型
      const children = item.children?.filter((item) => item.show) || []
      if (children.length) {
        menuItem.children = children
          .map((child) => this.getMenuItem(child, menuItem))
          .filter((item) => !!item)
          .sort((a, b) => a.order - b.order)
        if (!menuItem.children.length)
          delete menuItem.children
      }
      // 如果是 DIRECTORY 类型且没有路由路径，不显示为可点击的菜单项
      if (item.type === 'DIRECTORY' && !route.path) {
        menuItem.path = ''
      }
      return menuItem
    },
    generateRoute(item, parentKey) {
      let originPath
      let path = item.path
      let component = item.component

      // 处理外链菜单
      if (isExternal(item.path)) {
        originPath = item.path
        component = '/src/views/iframe/index.vue'
        path = `/iframe/${item.code}`
      }
      else if (item.type === 'DIRECTORY' && !item.component) {
        // DIRECTORY 类型如果没有组件，不生成路由
        path = ''
      }

      return {
        name: item.code,
        path,
        redirect: item.redirect,
        component,
        meta: {
          originPath,
          icon: `${item.icon}?mask`,
          title: item.name,
          layout: item.layout,
          keepAlive: !!item.keepAlive,
          parentKey,
          btns: item.children
            ?.filter((item) => item.type === 'BUTTON')
            .map((item) => ({ code: item.code, name: item.name }))
        }
      }
    },
    resetPermission() {
      this.$reset()
    }
  }
})
