import axios from 'axios'
import { request } from '@/utils'

export const getUserPermissionByToken = () => request.get('/permission/getUserPermissionByToken')
export const getButtons = ({ parentId }) => request.get(`/permission/button/${parentId}`)
export const getComponents = () => axios.get(`${import.meta.env.VITE_PUBLIC_PATH}components.json`)
export const addPermission = (data) => request.post('/permission', data)
export const savePermission = (id, data) => request.patch(`/permission/${id}`, data)
export const deletePermission = (id) => request.delete(`permission/${id}`)
export const getRolePermissions = () => request.get('/role/permissions/tree')
