import { request } from '@/utils'

/**
 * 用户管理 API
 * 遵循 RESTful 规范
 */

/**
 * 获取用户列表（分页）
 * @param {object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.limit 每页数量
 * @param {string} params.search 搜索关键词
 * @param {string} params.status 状态筛选
 * @param {number} params.deptId 部门ID筛选
 * @returns {Promise}
 */
export const getUserList = (params = {}) => request.get('/user/list', { params })

/**
 * 获取用户详情
 * @param {number} id 用户ID
 * @returns {Promise}
 */
export const getUserById = (id) => request.get(`/user/${id}`)

/**
 * 获取当前登录用户信息
 * @returns {Promise}
 */
export const getCurrentUser = () => request.get('/user/detail')

/**
 * 创建用户
 * @param {object} data 用户数据
 * @param {string} data.userName 用户名
 * @param {string} data.password 密码
 * @param {string} [data.nickName] 昵称
 * @param {string} [data.email] 邮箱
 * @param {string} [data.phonenumber] 手机号
 * @param {number} [data.deptId] 部门ID
 * @param {string} [data.status] 状态
 * @param {number[]} [data.roleIds] 角色ID数组
 * @returns {Promise}
 */
export const createUser = (data) => request.post('/user', data)

/**
 * 更新用户（部分更新）
 * @param {number} id 用户ID
 * @param {object} data 用户数据
 * @returns {Promise}
 */
export const updateUser = (id, data) => request.patch(`/user/${id}`, data)

/**
 * 更新当前用户自己的信息
 * @param {object} data 用户数据
 * @returns {Promise}
 */
export const updateCurrentUser = (data) => request.post('/user/update', data)

/**
 * 删除用户
 * @param {number} id 用户ID
 * @returns {Promise}
 */
export const deleteUser = (id) => request.delete(`/user/${id}`)

/**
 * 批量删除用户
 * @param {number[]} ids 用户ID数组
 * @returns {Promise}
 */
export const batchDeleteUsers = (ids) => request.post('/user/batch-delete', { ids })

/**
 * 上传用户头像
 * @param {FormData} data 头像文件
 * @returns {Promise}
 */
export const uploadAvatar = (data) => request.post('/user/upload', data)

/**
 * 重置用户密码
 * @param {number} id 用户ID
 * @returns {Promise}
 */
export const resetPassword = (id) => request.post(`/user/${id}/reset-password`)

/**
 * 修改用户状态
 * @param {number} id 用户ID
 * @param {string} status 状态值（0正常 1停用）
 * @returns {Promise}
 */
export const updateUserStatus = (id, status) => request.patch(`/user/${id}/status`, { status })

/**
 * 获取所有角色列表
 * @returns {Promise}
 */
export const getAllRoles = () => request.get('/role')

/**
 * 重置管理员密码（开发测试用）
 * @returns {Promise}
 */
export const resetAdminPassword = () => request.get('/user/reset-admin-password')
