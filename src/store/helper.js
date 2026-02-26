import { cloneDeep } from 'lodash-es'
import { auth } from '@/api'
import { getUserPermissionByToken } from '@/api/permission.js'
import { basePermissions } from '@/settings'

export const getUserInfo = async () => {
  const { data: result } = await auth.getUser()
  return result
}

// 将后端菜单数据转换为前端权限格式
function transformMenuToPermission(menuItem) {
  // menuType: "M" 表示目录(DIRECTORY), "C" 表示菜单(MENU)
  const menuType = menuItem.menuType
  let type = 'MENU'
  if (menuType === 'M') {
    type = 'DIRECTORY'
  }
  else if (menuType === 'C') {
    type = 'MENU'
  }
  else if (menuItem.type) {
    // 如果没有 menuType，使用原始 type 字段
    type = menuItem.type
  }

  const transformed = {
    id: menuItem.id,
    parentId: menuItem.parentId,
    code: menuItem.code || menuItem.id,
    name: menuItem.menuName || menuItem.name || '',
    type, // 转换后的 type 字段（DIRECTORY 或 MENU）
    path: menuItem.path,
    icon: menuItem.icon || '',
    order: menuItem.order ?? menuItem.orderNum ?? 0,
    enable: menuItem.enable !== undefined ? menuItem.enable : (menuItem.status === 0),
    // 优先使用 visible 字段判断是否显示，因为 show 字段可能不准确
    show: menuItem.visible !== undefined ? (menuItem.visible === 1) : (menuItem.show === true),
    keepAlive: menuItem.keepAlive !== undefined ? !!menuItem.keepAlive : (menuItem.isCache === 0)
  }

  // 处理 component 字段
  if (menuItem.component) {
    let componentPath = menuItem.component
    if (!componentPath.startsWith('/src/views/')) {
      componentPath = `/src/views/${componentPath}`
    }
    if (!componentPath.endsWith('.vue')) {
      componentPath = `${componentPath}.vue`
    }
    transformed.component = componentPath
  }

  // 处理外链菜单
  if (menuItem.isFrame === 0 && menuItem.path && (menuItem.path.startsWith('http://') || menuItem.path.startsWith('https://'))) {
    transformed.isFrame = 0
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

  const finalPermissions = cloneDeep(basePermissions).concat(asyncPermissions)
  return finalPermissions
}
