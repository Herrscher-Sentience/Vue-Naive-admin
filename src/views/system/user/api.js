import { request } from '@/utils'

/**
 * 用户注册/创建用户
 * @param {object} data 用户数据
 * @returns {Promise}
 */
export const createUser = (data) => request.post('/user/register', data)

/**
 * 获取用户列表（分页）
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export const getUserList = (params = {}) => request.get('/user/list', { params })

/**
 * 获取当前用户信息
 * @returns {Promise}
 */
export const getUserInfo = () => request.get('/user/detail')

/**
 * 更新当前用户信息
 * @param {object} data 用户数据
 * @returns {Promise}
 */
export const updateUser = (data) => request.post('/user/update', data)

/**
 * 上传用户头像
 * @param {FormData} data 头像文件
 * @returns {Promise}
 */
export const uploadAvatar = (data) => request.post('/user/upload', data)

/**
 * 重置管理员密码
 * @returns {Promise}
 */
export const resetAdminPassword = () => request.get('/user/reset-admin-password')

/**
 * 获取所有角色列表
 * @returns {Promise}
 */
export const getAllRoles = () => request.get('/role')
