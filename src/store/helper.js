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
    id: menuItem.id,
    parentId: menuItem.parentId,
    code: menuItem.code || menuItem.id,
    name: menuItem.menuName || menuItem.name || '',
    type: menuItem.type, // 保留原始 type 字段（DIRECTORY 或 MENU）
    path: menuItem.path,
    icon: menuItem.icon || '',
    order: menuItem.order ?? menuItem.orderNum ?? 0,
    enable: menuItem.enable !== undefined ? menuItem.enable : menuItem.status === 1,
    show: menuItem.show !== undefined ? menuItem.show : (menuItem.visible === 0),
    keepAlive: menuItem.keepAlive !== undefined ? !!menuItem.keepAlive : (menuItem.isCache === 0)
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
    console.log('后端返回的原始菜单数据:', result.menu)

    if (result.menu) {
      asyncPermissions = result.menu.map((item) => transformMenuToPermission(item))
      console.log('转换后的菜单数据:', asyncPermissions)
    }
  }
  catch (error) {
    console.error(error)
  }

  const finalPermissions = cloneDeep(basePermissions).concat(asyncPermissions)
  console.log('最终权限数据:', finalPermissions)
  return finalPermissions
}
