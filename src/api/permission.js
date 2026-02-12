import { request } from '@/utils'

export const getUserPermissionByToken = () => request.get('/permission/getUserPermissionByToken')
