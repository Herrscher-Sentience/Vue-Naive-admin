import { request } from '@/utils'

export default {
  create: (data) => request.post('/sys/dept', data),
  read: (params = {}) => request.get('/sys/dept/list', { params }),
  update: (data) => request.put('/sys/dept', data),
  delete: (id) => request.delete(`/sys/dept/${id}`),
  info: (id) => request.get(`/sys/dept/${id}`)
}
