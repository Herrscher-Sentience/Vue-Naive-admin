import { cloneDeep } from 'lodash-es'
import { auth } from '@/api'
import { getUserPermissionByToken } from '@/api/modules/permission.js'
import { basePermissions } from '@/settings'

export const getUserInfo = async () => {
  const { data: result } = await auth.getUser()
  return result
}

// 将后端菜单数据转换为前端权限格式
function transformMenuToPermission(menuItem) {
  const transformed = {
    code: menuItem.id,
    name: menuItem.name,
    type: 'MENU',
    path: menuItem.url,
    icon: menuItem.icon || '',
    order: menuItem.sort ?? 0,
    enable: menuItem.status === '1',
    show: menuItem.menuHide === 0
  }

  // 处理 component 字段
  if (menuItem.component) {
    // 将 component 转换为 /src/views/xxx.vue 格式（匹配 import.meta.glob 返回的路径）
    let componentPath = menuItem.component
    if (!componentPath.startsWith('/src/views/')) {
      componentPath = `/src/views/${componentPath}`
    }
    if (!componentPath.endsWith('.vue')) {
      componentPath = `${componentPath}.vue`
    }
    transformed.component = componentPath
  }

  // 处理外部链接
  if (menuItem.openStyle === 1 && menuItem.url && (menuItem.url.startsWith('http://') || menuItem.url.startsWith('https://'))) {
    transformed.path = menuItem.url
  }

  // 递归处理子菜单
  if (menuItem.children && menuItem.children.length > 0) {
    transformed.children = menuItem.children
      .map((child) => transformMenuToPermission(child))
      .filter((item) => !!item)
  }

  return transformed
}

export const getUserPermission = async () => {
  let asyncPermissions = []
  try {
    const { data: result } = await getUserPermissionByToken()

    if (result.menu) {
      asyncPermissions = result.menu.map((item) => transformMenuToPermission(item))
    }
  }
  catch (error) {
    console.error(error)
  }

  return cloneDeep(basePermissions).concat(asyncPermissions)
}
