import { defineStore } from 'pinia'
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
      const menuItems = this.permissions.filter((item) => item.type === 'MENU')
      this.menus = menuItems
        .map((item) => this.getMenuItem(item))
        .filter((item) => !!item)
        .sort((a, b) => a.order - b.order)
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
      const children = item.children?.filter((item) => item.type === 'MENU') || []
      if (children.length) {
        menuItem.children = children
          .map((child) => this.getMenuItem(child, menuItem))
          .filter((item) => !!item)
          .sort((a, b) => a.order - b.order)
        if (!menuItem.children.length)
          delete menuItem.children
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
