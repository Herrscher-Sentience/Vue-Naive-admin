import axios from 'axios'
import { request } from '@/utils'

/**
 * 获取菜单列表数据
 * 该函数通过调用API接口获取系统的菜单列表信息
 * @returns {Promise} 返回一个Promise对象，包含菜单列表数据
 */
export const getMenuList = () => request.get('/permission/menuList')

export const getButtons = ({ menuId }) => request.get(`/permission/buttons/${menuId}`)

/**
 * 获取组件配置信息
 * 通过API请求获取组件的配置文件
 * @returns {Promise} 返回一个axios请求的Promise对象
 */
export const getComponents = () => axios.get(`${import.meta.env.VITE_PUBLIC_PATH}components.json`)
/**
 * 添加权限的API请求函数
 * @param {object} data - 要添加的权限数据对象
 * @returns {Promise} - 返回一个Promise对象，包含请求的结果
 */
export const addPermission = (data) => request.post('/permission', data) // 发送POST请求到'/permission'接口，传入data参数
export const savePermission = (id, data) => request.patch(`/permission/${id}`, data)
export const deletePermission = (id) => request.delete(`permission/${id}`)
