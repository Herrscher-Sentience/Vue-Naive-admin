<template>
  <div class="wh-full flex-col bg-[url(@/assets/images/login_bg.webp)] bg-cover">
    <div
      class="m-auto max-w-700 min-w-345 f-c-c rounded-8 auto-bg bg-opacity-20 bg-cover p-12 card-shadow"
    >
      <div class="hidden w-380 px-20 py-35 md:block">
        <img alt="login_banner" class="w-full" src="@/assets/images/login_banner.webp">
      </div>

      <div class="w-320 flex-col px-20 py-32">
        <h2 class="f-c-c text-24 text-#6a6a6a font-normal">
          <img class="mr-12 h-50" src="@/assets/images/logo.png">
          {{ title }}
        </h2>
        <n-input
          v-model:value="loginInfo.username"
          :maxlength="20"
          autofocus
          class="mt-32 h-40 items-center"
          placeholder="请输入用户名"
        >
          <template #prefix>
            <i class="i-fe:user mr-12 opacity-20" />
          </template>
        </n-input>
        <n-input
          v-model:value="loginInfo.password"
          :maxlength="20"
          class="mt-20 h-40 items-center"
          placeholder="请输入密码"
          show-password-on="mousedown"
          type="password"
          @keydown.enter="handleLogin()"
        >
          <template #prefix>
            <i class="i-fe:lock mr-12 opacity-20" />
          </template>
        </n-input>

        <div class="mt-20 flex items-center">
          <n-input
            v-model:value="loginInfo.captchaCode"
            :maxlength="4"
            class="h-40 items-center"
            palceholder="请输入验证码"
            @keydown.enter="handleLogin()"
          >
            <template #prefix>
              <i class="i-fe:key mr-12 opacity-20" />
            </template>
          </n-input>
          <img
            v-if="captchaImage"
            :src="captchaImage"
            alt="验证码"
            class="ml-12 w-[50%] cursor-pointer"
            height="40"
            @click="initCaptcha"
          >
        </div>

        <n-checkbox
          :checked="isRemember"
          :on-update:checked="(val) => (isRemember = val)"
          class="mt-20"
          label="记住我"
        />

        <div class="mt-20 flex items-center">
          <n-button
            class="h-40 flex-1 rounded-5 text-16"
            ghost
            type="primary"
            @click="quickLogin()"
          >
            一键体验
          </n-button>

          <n-button
            :loading="loading"
            class="ml-32 h-40 flex-1 rounded-5 text-16"
            type="primary"
            @click="handleLogin()"
          >
            登录
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStorage } from '@vueuse/core'
import { auth } from '@/api'
import { useAuthStore } from '@/store'
import { lStorage, throttle } from '@/utils'
import { getImageVerifyCode } from '@/views/login/api.js'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const title = import.meta.env.VITE_TITLE

const loginInfo = ref({ username: '', password: '' })
const captchaImage = ref('')
const captchaId = ref('')
const loading = ref(false)
const isRemember = useStorage('isRemember', true)

const initCaptcha = throttle(async () => {
  const { data: result } = await getImageVerifyCode()
  captchaImage.value = result.captchaImage
  captchaId.value = result.captchaId
}, 500)

const quickLogin = () => {
  loginInfo.value.username = 'admin'
  loginInfo.value.password = 'admin'
  handleLogin(true)
}

const handleLogin = async (isQuick) => {
  const { username, password, captchaCode } = loginInfo.value
  if (!username || !password) {
    return $message.warning('请输入用户名和密码')
  }
  if (!isQuick && !captchaCode) {
    return $message.warning('请输入验证码')
  }
  try {
    loading.value = true
    $message.loading('正在验证，请稍后...', { key: 'login' })
    const { data } = await auth.login({ username, password: password.toString(), captchaCode, captchaId: captchaId.value, isQuick })
    if (isRemember.value) {
      lStorage.set('loginInfo', { username, password })
    }
    else {
      lStorage.remove('loginInfo')
    }
    onLoginSuccess(data)
  }
  catch (error) {
    // 10003为验证码错误专属业务码
    if (error?.code === 10003) {
      // 为防止爆破，验证码错误则刷新验证码
      initCaptcha()
    }
    $message.destroy('login')
    console.error(error)
  }
  loading.value = false
}

const onLoginSuccess = async (data = {}) => {
  authStore.setToken(data)
  $message.loading('登录中...', { key: 'login' })
  try {
    $message.success('登录成功', { key: 'login' })
    if (route.query.redirect) {
      const path = route.query.redirect
      delete route.query.redirect
      router.push({ path, query: route.query })
    }
    else {
      router.push('/')
    }
  }
  catch (error) {
    console.error(error)
    $message.destroy('login')
  }
}

// 初始化
const localLoginInfo = lStorage.get('loginInfo')
if (localLoginInfo) {
  loginInfo.value.username = localLoginInfo.username || ''
  loginInfo.value.password = localLoginInfo.password || ''
}
initCaptcha()
</script>
