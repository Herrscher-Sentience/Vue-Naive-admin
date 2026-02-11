import { request } from '@/utils'

export const createRole = (data) => request.post('/role', data)
export const readRole = (params = {}) => request.get('/role/page', { params })
export const updateRole = (data) => request.patch(`/role/${data.id}`, data)
export const deleteRole = (id) => request.delete(`/role/${id}`)
export const getAllPermissionTree = () => request.get('/permission/tree')
export const getAllUsers = (params = {}) => request.get('/user', { params })
export const addRoleUsers = (roleId, data) => request.patch(`/role/users/add/${roleId}`, data)
export const removeRoleUsers = (roleId, data) => request.patch(`/role/users/remove/${roleId}`, data)
