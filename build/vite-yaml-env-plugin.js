import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

// 缓存已加载的配置
const configCache = new Map()

/**
 * 加载 YAML 配置文件（带缓存）
 * @param {string} mode - 环境模式
 * @returns {object} YAML 配置对象
 */
export function loadYamlConfig(mode) {
  const envMode = mode || process.env.NODE_ENV || 'development'

  // 检查缓存
  if (configCache.has(envMode)) {
    return configCache.get(envMode)
  }

  const configPath = path.resolve(process.cwd(), `config/${envMode}.yaml`)

  try {
    const fileContents = fs.readFileSync(configPath, 'utf8')
    const yamlConfig = yaml.load(fileContents)
    configCache.set(envMode, yamlConfig)
    return yamlConfig
  }
  catch (e) {
    console.error(`Error loading YAML config from ${configPath}:`, e)
    return {}
  }
}

/**
 * 获取环境变量（从 YAML 配置中提取）
 * @param {string} mode - 环境模式
 * @returns {object} 环境变量对象
 */
export function getEnvVars(mode) {
  const yamlConfig = loadYamlConfig(mode)

  return {
    VITE_TITLE: yamlConfig?.app?.title || 'Vue Naive Admin',
    VITE_USE_HASH: String(yamlConfig?.vite?.useHash || false),
    VITE_PUBLIC_PATH: yamlConfig?.vite?.publicPath || '/',
    VITE_AXIOS_BASE_URL: yamlConfig?.api?.baseUrl || '',
    VITE_PROXY_TARGET: yamlConfig?.proxy?.target || 'http://localhost:8085'
  }
}

/**
 * Vite 插件：将 YAML 配置注入到环境变量中
 */
export default function yamlEnvPlugin() {
  let cachedEnvVars = null

  return {
    name: 'vite-yaml-env',
    config: ({ mode }, { command: _command }) => {
      // 使用缓存的配置
      if (!cachedEnvVars) {
        cachedEnvVars = getEnvVars(mode)

        // 将环境变量注入到 process.env 中
        Object.entries(cachedEnvVars).forEach(([key, value]) => {
          process.env[key] = value
        })
      }

      return {
        define: {
          'import.meta.env.VITE_TITLE': JSON.stringify(cachedEnvVars.VITE_TITLE),
          'import.meta.env.VITE_USE_HASH': JSON.stringify(cachedEnvVars.VITE_USE_HASH),
          'import.meta.env.VITE_PUBLIC_PATH': JSON.stringify(cachedEnvVars.VITE_PUBLIC_PATH),
          'import.meta.env.VITE_AXIOS_BASE_URL': JSON.stringify(cachedEnvVars.VITE_AXIOS_BASE_URL),
          'import.meta.env.VITE_PROXY_TARGET': JSON.stringify(cachedEnvVars.VITE_PROXY_TARGET)
        }
      }
    }
  }
}
