import { request } from '@/utils'

/**
 * 创建角色
 * @param {object} data 角色数据
 * @returns {Promise}
 */
export const createRole = (data) => request.post('/role', data)

/**
 * 获取所有角色
 * @returns {Promise}
 */
export const getAllRoles = () => request.get('/role')

/**
 * 分页获取角色列表
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export const getRolePage = (params = {}) => request.get('/role/page', { params })

/**
 * 获取单个角色详情
 * @param {number} id 角色ID
 * @returns {Promise}
 */
export const getRoleById = (id) => request.get(`/role/${id}`)

/**
 * 更新角色
 * @param {number} id 角色ID
 * @param {object} data 角色数据
 * @returns {Promise}
 */
export const updateRole = (id, data) => request.patch(`/role/${id}`, data)

/**
 * 删除角色
 * @param {number} id 角色ID
 * @returns {Promise}
 */
export const deleteRole = (id) => request.delete(`/role/${id}`)

// 兼容旧接口
export const readRole = getRolePage
