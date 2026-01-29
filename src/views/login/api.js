import { request } from '@/utils'

/**
 * 切换用户角色的API请求函数
 * @param {object} data - 包含角色切换所需的数据对象
 * @returns {Promise} - 返回一个Promise对象，用于处理API请求的响应
 */
export const toggleRole = (data) => request.post('/auth/role/toggle', data)

/**
 * 登录方法
 * @param {object} data - 登录所需的数据，通常包含用户名和密码等信息
 * @returns {Promise} - 返回一个Promise对象，用于处理登录请求的响应结果
 */
export const login = (data) => request.post('/auth/login', data, { needToken: false }) // 发起登录请求，不需要携带token

/**
 * 获取用户详情信息
 * @returns {Promise} 返回一个Promise对象，包含用户详情数据
 */
export const getUser = () => request.get('/user/detail')

/**
 * 获取验证码的API请求函数
 * 该函数用于向服务器请求验证码
 * @returns {Promise} 返回一个Promise对象，包含服务器响应的验证码数据
 */
export const getImageVerifyCode = () => request.get('/auth/image-captcha')
