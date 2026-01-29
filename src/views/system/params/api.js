import { request } from '@/utils'

export default {
  create: (data) => request.post('/sys/params', data),
  read: (params = {}) => request.get('/sys/params/page', { params }),
  update: (data) => request.put('/sys/params', data),
  delete: (id) => request.delete(`/sys/params/${id}`),
  info: (id) => request.get(`/sys/params/${id}`),
  export: (params = {}) => request.get('/sys/params/export', { params, responseType: 'blob' })
}
