import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

/**
 * 获取当前环境
 */
const getEnv = () => {
  return process.env.NODE_ENV || 'development'
}

/**
 * 读取 YAML 配置文件
 */
const loadConfig = () => {
  const env = getEnv()
  const configPath = path.resolve(process.cwd(), `config/${env}.yaml`)

  try {
    const fileContents = fs.readFileSync(configPath, 'utf8')
    const config = yaml.load(fileContents)
    return config
  }
  catch (e) {
    console.error(`Error loading config from ${configPath}:`, e)
    return {}
  }
}

const config = loadConfig()

export default config
