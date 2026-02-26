import { request } from '@/utils'

/**
 * 获取菜单树列表
 * @returns {Promise} 返回菜单树数据
 */
export const getMenuList = () => request.get('/menu/list')

/**
 * 创建菜单
 * @param {object} data 菜单数据
 * @returns {Promise}
 */
export const createMenu = (data) => request.post('/menu', data)

/**
 * 更新菜单
 * @param {number} id 菜单ID
 * @param {object} data 菜单数据
 * @returns {Promise}
 */
export const updateMenu = (id, data) => request.patch(`/menu/${id}`, data)

/**
 * 删除菜单
 * @param {number} id 菜单ID
 * @returns {Promise}
 */
export const deleteMenu = (id) => request.delete(`/menu/${id}`)
