<template>
  <BasicModal ref="modalRef" width="600px">
    <n-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-width="100"
      label-placement="left"
    >
      <!-- 用户名 -->
      <n-form-item path="userName" label="用户名">
        <n-input
          v-model:value="formData.userName"
          :disabled="modalAction !== 'add'"
          placeholder="请输入用户名"
          maxlength="30"
        />
      </n-form-item>

      <!-- 密码（新增时显示） -->
      <n-form-item v-if="modalAction === 'add'" path="password" label="密码">
        <n-input
          v-model:value="formData.password"
          type="password"
          show-password-on="mousedown"
          placeholder="请输入密码（6-100位）"
          maxlength="100"
        />
      </n-form-item>

      <!-- 昵称 -->
      <n-form-item v-if="showAllFields" path="nickName" label="昵称">
        <n-input
          v-model:value="formData.nickName"
          placeholder="请输入昵称"
          maxlength="30"
        />
      </n-form-item>

      <!-- 邮箱 -->
      <n-form-item v-if="showAllFields" path="email" label="邮箱">
        <n-input
          v-model:value="formData.email"
          placeholder="请输入邮箱"
          maxlength="50"
        />
      </n-form-item>

      <!-- 手机号 -->
      <n-form-item v-if="showAllFields" path="phonenumber" label="手机号">
        <n-input
          v-model:value="formData.phonenumber"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </n-form-item>

      <!-- 角色 -->
      <n-form-item path="roleIds" label="角色">
        <n-select
          v-model:value="formData.roleIds"
          :options="roleOptions"
          label-field="name"
          value-field="id"
          clearable
          filterable
          multiple
          placeholder="请选择角色"
        />
      </n-form-item>

      <!-- 状态（新增时显示） -->
      <n-form-item v-if="modalAction === 'add'" path="status" label="状态">
        <n-radio-group v-model:value="formData.status">
          <n-radio value="0">
            正常
          </n-radio>
          <n-radio value="1">
            停用
          </n-radio>
        </n-radio-group>
      </n-form-item>
    </n-form>

    <n-alert v-if="modalAction === 'add'" type="warning" closable class="mt-12">
      详细信息需由用户本人补充修改
    </n-alert>
  </BasicModal>
</template>

<script setup>
import { computed, ref } from 'vue'
import { BasicModal } from '@/components/BasicModal'
import { useForm, useModal } from '@/composables'
import { createUser, updateUser } from '../api'

defineOptions({ name: 'UserModal' })

const props = defineProps({
  roles: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refresh'])

// ==================== 常量定义 ====================
const DEFAULT_FORM = {
  userName: '',
  password: '',
  nickName: '',
  email: '',
  phonenumber: '',
  status: '0',
  roleIds: []
}

// ==================== 表单验证规则 ====================
const formRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { max: 30, message: '用户名不能超过30个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度为6-100位', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phonenumber: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// ==================== 响应式状态 ====================
const modalAction = ref('')
const [formRef, formData, validation] = useForm()
const [modalRef, okLoading] = useModal()

// ==================== 计算属性 ====================

/** 是否显示所有字段（编辑模式） */
const showAllFields = computed(() => modalAction.value === 'edit')

/** 角色选项 */
const roleOptions = computed(() => props.roles)

// ==================== 方法定义 ====================

/**
 * 打开弹窗
 * @param {object} options 配置选项
 */
const handleOpen = (options = {}) => {
  const { action, row = {}, ...rest } = options
  modalAction.value = action

  if (action === 'assignRole') {
    // 分配角色模式：只显示角色选择
    formData.value = {
      userId: row.userId,
      userName: row.userName,
      roleIds: row.roleIds || []
    }
  }
  else if (action === 'edit') {
    // 编辑模式
    formData.value = {
      ...DEFAULT_FORM,
      ...row,
      roleIds: row.roles?.map((r) => r.id) || []
    }
  }
  else {
    // 新增模式
    formData.value = { ...DEFAULT_FORM }
  }

  modalRef.value.open({
    ...rest,
    onOk: handleSave
  })
}

/**
 * 保存用户数据
 */
const handleSave = async () => {
  await validation()
  okLoading.value = true

  try {
    if (modalAction.value === 'add') {
      await createUser(formData.value)
    }
    else if (modalAction.value === 'edit' || modalAction.value === 'assignRole') {
      const submitData = {
        roleIds: formData.value.roleIds
      }
      if (modalAction.value === 'edit') {
        submitData.nickName = formData.value.nickName
        submitData.email = formData.value.email
        submitData.phonenumber = formData.value.phonenumber
      }
      await updateUser(formData.value.userId, submitData)
    }

    $message.success('保存成功')
    emit('refresh')
  }
  catch (error) {
    console.error('保存用户失败:', error)
    $message.error(error.message || '保存失败')
    return false
  }
  finally {
    okLoading.value = false
  }
}

// ==================== 暴露方法 ====================

defineExpose({
  handleOpen
})
</script>
