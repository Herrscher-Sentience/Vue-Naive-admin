/**********************************
 * @Author: Ronnie Zhang
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

// 通用状态
export const STATUS = {
  ENABLED: 1,
  DISABLED: 0
}

// 通用响应码
export const RESPONSE_CODE = {
  SUCCESS: 0,
  ERROR: 1,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404
}

// 本地存储键名
export const STORAGE_KEY = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed'
}

// 路由名称
export const ROUTE_NAME = {
  HOME: 'Home',
  LOGIN: 'Login',
  ERROR_403: 'Error403',
  ERROR_404: 'Error404'
}
