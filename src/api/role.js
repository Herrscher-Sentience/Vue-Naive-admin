import { request } from '@/utils'

// 参数转换：将前端参数转换为后端参数
function transformParams(params) {
  const transformed = { ...params }
  if (params.pageNo !== undefined) {
    transformed.page = params.pageNo
    delete transformed.pageNo
  }
  if (params.pageSize !== undefined) {
    transformed.limit = params.pageSize
    delete transformed.pageSize
  }
  return transformed
}

export default {
  create: (data) => request.post('/role', data),
  read: (params = {}) => request.get('/role/page', { params: transformParams(params) }),
  update: (data) => request.patch(`/role/${data.id}`, data),
  delete: (id) => request.delete(`/role/${id}`),
  getAllPermissionTree: () => request.get('/menu/list'),
  getAllUsers: (params = {}) => request.get('/user/list', { params: transformParams(params) })
  // 分配用户接口，需要在后端实现
  // addRoleUsers: (roleId, data) => request.patch(`/role/users/add/${roleId}`, data),
  // removeRoleUsers: (roleId, data) => request.patch(`/role/users/remove/${roleId}`, data)
}
