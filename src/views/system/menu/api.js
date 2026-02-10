import axios from 'axios'
import { request } from '@/utils'

/**
 * 获取菜单列表数据
 * 该函数通过调用API接口获取系统的菜单按钮列表信息
 * @returns {Promise} 返回一个Promise对象，包含菜单列表数据
 */
export const getMenuList = () => request.get('/menu/list')

/**
 * 获取组件配置信息
 */
export const getComponents = () => axios.get(`${import.meta.env.VITE_PUBLIC_PATH}components.json`)

/**
 * 添加权限的A
 */
export const addPermission = (data) => request.post('/menu', data)

export const savePermission = (id, data) => request.patch(`/menu/${id}`, data)

export const deletePermission = (id) => request.delete(`menu/${id}`)
