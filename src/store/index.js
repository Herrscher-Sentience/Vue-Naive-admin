import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export function setupStore(app) {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)
}

export { useAppStore } from './modules/app'
export { useAuthStore } from './modules/auth'
export { usePermissionStore } from './modules/permission'
export { useRouterStore } from './modules/router'
export { useTabStore } from './modules/tab'
export { useUserStore } from './modules/user'
