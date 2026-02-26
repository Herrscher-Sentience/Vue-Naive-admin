import { request } from '@/utils'

export default {
  list: () => request.get('/menu/list'),
  create: (data) => request.post('/menu', data),
  update: (id, data) => request.patch(`/menu/${id}`, data),
  delete: (id) => request.delete(`/menu/${id}`)
}
