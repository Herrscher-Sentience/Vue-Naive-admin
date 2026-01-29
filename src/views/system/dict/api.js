import { request } from '@/utils'

export default {
  create: (data) => request.post('/sys/dict', data),
  read: (params = {}) => request.get('/sys/dict/page', { params }),
  update: (data) => request.put('/sys/dict', data),
  delete: (id) => request.delete(`/sys/dict/${id}`),
  info: (id) => request.get(`/sys/dict/${id}`)
}
