import { request } from '@/utils'

export default {
  create: (data) => request.post('/sys/region', data),
  read: (params = {}) => request.get('/sys/region/list', { params }),
  update: (data) => request.put('/sys/region', data),
  delete: (id) => request.delete(`/sys/region/${id}`),
  info: (id) => request.get(`/sys/region/${id}`)
}
