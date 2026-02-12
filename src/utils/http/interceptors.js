import axios from 'axios'
import { auth } from '@/api'
import { useAuthStore } from '@/store'
import { resolveResError } from './helpers'

// 自定义错误类
class ApiError extends Error {
  constructor(code, message, error) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.error = error
  }
}

export function setupInterceptors(axiosInstance) {
  const SUCCESS_CODES = [0, 200]
  function resResolve(response) {
    const { data, status, config, statusText, headers } = response
    if (headers['content-type']?.includes('json')) {
      if (SUCCESS_CODES.includes(data?.code)) {
        return Promise.resolve(data)
      }
      const code = data?.code ?? status

      const needTip = config?.needTip !== false

      // 根据code处理对应的操作，并返回处理后的message
      const message = resolveResError(code, data?.message ?? statusText, needTip)

      return Promise.reject(new ApiError(code, message, data ?? response))
    }
    return Promise.resolve(data ?? response)
  }

  axiosInstance.interceptors.request.use(reqResolve, reqReject)
  axiosInstance.interceptors.response.use(resResolve, resReject)
}

function reqResolve(config) {
  // 处理不需要token的请求
  if (config.needToken === false) {
    return config
  }

  const authStore = useAuthStore()
  const { accessToken, isRefreshing } = authStore

  // 如果正在刷新 token，将请求加入等待队列
  if (isRefreshing && config.url !== '/auth/refresh/token') {
    return new Promise((resolve) => {
      authStore.addRefreshSubscriber((newToken) => {
        config.headers.Authorization = `Bearer ${newToken}`
        resolve(config)
      })
    }).then((config) => config)
  }

  if (accessToken) {
    // token: Bearer + xxx
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
}

function reqReject(error) {
  return Promise.reject(error)
}

async function resReject(error) {
  if (!error || !error.response) {
    const code = error?.code
    /** 根据code处理对应的操作，并返回处理后的message */
    const message = resolveResError(code, error.message)
    return Promise.reject(new ApiError(code, message, error))
  }

  const { data, status, config } = error.response
  const code = data?.code ?? status

  // 处理 401 未授权错误，尝试刷新 token
  if (code === 401 && config?.url !== '/auth/refresh/token' && config?.needToken !== false) {
    const authStore = useAuthStore()

    // 如果没有 refreshToken，直接退出登录
    if (!authStore.refreshToken) {
      authStore.logout()
      return Promise.reject(new ApiError(code, '登录已过期，请重新登录', error))
    }

    // 如果正在刷新 token，将请求加入等待队列
    if (authStore.isRefreshing) {
      return new Promise((resolve) => {
        authStore.addRefreshSubscriber((newToken) => {
          config.headers.Authorization = `Bearer ${newToken}`
          // 使用新的 token 重试请求
          resolve(axios(config))
        })
      })
    }

    // 开始刷新 token
    authStore.isRefreshing = true

    try {
      // 调用刷新 token 接口
      const { data: refreshData } = await auth.refreshToken()
      // 更新 store 中的 token
      authStore.setToken({
        accessToken: refreshData.accessToken,
        refreshToken: refreshData.refreshToken || authStore.refreshToken
      })
      // 通知所有等待的请求
      authStore.onRefreshed(refreshData.accessToken)
      // 重试当前请求
      config.headers.Authorization = `Bearer ${refreshData.accessToken}`
      return axios(config)
    }
    catch (refreshError) {
      // 刷新失败，清除 token 并跳转登录页
      authStore.logout()
      window.$message?.error('登录已过期，请重新登录')
      return Promise.reject(new ApiError(401, '登录已过期，请重新登录', refreshError))
    }
    finally {
      authStore.isRefreshing = false
    }
  }

  const needTip = config?.needTip !== false
  const message = resolveResError(code, data?.message ?? error.message, needTip)
  return Promise.reject(new ApiError(code, message, error.response?.data || error.response))
}
