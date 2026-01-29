import axios from 'axios'
import { request } from '@/utils'

export default {
  getUserPermission: () => request.get('/permission/getUserPermissionByToken'),
  getButtons: ({ parentId }) => request.get(`/permission/button/${parentId}`),
  getComponents: () => axios.get(`${import.meta.env.VITE_PUBLIC_PATH}components.json`),
  addPermission: (data) => request.post('/permission', data),
  savePermission: (id, data) => request.patch(`/permission/${id}`, data),
  deletePermission: (id) => request.delete(`permission/${id}`),
  getRolePermissions: () => request.get('/role/permissions/tree')
}
