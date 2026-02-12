import { request } from '@/utils'

export const toggleRole = (data) => request.post('/auth/role/toggle', data)
export const login = (data) => request.post('/auth/login', data, { needToken: false })
export const getUser = () => request.get('/user/detail')
export const logout = () => request.post('/auth/logout', {}, { needTip: false })
export const refreshToken = () => request.get('/auth/refresh/token')
export const switchCurrentRole = (role) => request.post(`/auth/current-role/switch/${role}`)
export const changePassword = (data) => request.post('/auth/password', data)
