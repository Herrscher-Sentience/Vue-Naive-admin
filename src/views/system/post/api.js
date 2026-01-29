import { request } from '@/utils'

export default {
  create: (data) => request.post('/sys/post', data),
  read: (params = {}) => request.get('/sys/post/page', { params }),
  update: (data) => request.put('/sys/post', data),
  delete: (id) => request.delete(`/sys/post/${id}`),
  info: (id) => request.get(`/sys/post/${id}`)
}
