<template>
  <BasicModal ref="modalRef" width="600px">
    <n-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-width="100"
      label-placement="left"
    >
      <!-- 角色名称 -->
      <n-form-item path="name" label="角色名称">
        <n-input
          v-model:value="formData.name"
          :disabled="isSuperAdmin"
          placeholder="请输入角色名称"
          maxlength="50"
        />
      </n-form-item>

      <!-- 角色值 -->
      <n-form-item path="value" label="角色值">
        <n-input
          v-model:value="formData.value"
          :disabled="modalAction === 'edit'"
          placeholder="请输入角色值（如：ADMIN）"
          maxlength="255"
        />
      </n-form-item>

      <!-- 菜单权限 -->
      <n-form-item path="menuIds" label="菜单权限">
        <n-tree
          :checked-keys="formData.menuIds"
          :data="normalizedPermissionTree"
          :on-update:checked-keys="handleMenuCheck"
          :selectable="false"
          check-on-click
          checkable
          class="menu-tree"
          default-expand-all
          key-field="id"
          label-field="menuName"
        />
      </n-form-item>

      <!-- 备注 -->
      <n-form-item path="remark" label="备注">
        <n-input
          v-model:value="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
          maxlength="255"
        />
      </n-form-item>

      <!-- 状态 -->
      <n-form-item path="status" label="状态">
        <n-radio-group v-model:value="formData.status" :disabled="isSuperAdmin">
          <n-radio value="1">
            启用
          </n-radio>
          <n-radio value="0">
            停用
          </n-radio>
        </n-radio-group>
      </n-form-item>
    </n-form>
  </BasicModal>
</template>

<script setup>
import { computed, ref } from 'vue'
import { BasicModal } from '@/components/BasicModal'
import { useForm, useModal } from '@/composables'
import { isArray } from '@/utils'
import { createRole, getRoleById, updateRole } from '../api'

defineOptions({ name: 'RoleModal' })

const props = defineProps({
  permissionTree: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refresh'])

// ==================== 常量定义 ====================
const defaultForm = {
  name: '',
  value: '',
  status: '1',
  remark: '',
  menuIds: []
}

// ==================== 表单验证规则 ====================
const formRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { max: 50, message: '角色名称不能超过50个字符', trigger: 'blur' }
  ],
  value: [
    { required: true, message: '请输入角色值', trigger: 'blur' },
    { max: 255, message: '角色值不能超过255个字符', trigger: 'blur' }
  ]
}

// ==================== 响应式状态 ====================
const modalAction = ref('')
const [formRef, formData, validation] = useForm()
const [modalRef, okLoading] = useModal()

// ==================== 计算属性 ====================

/** 是否为超级管理员 */
const isSuperAdmin = computed(() => formData.value.value === 'admin')

/** 标准化权限树数据 */
const normalizedPermissionTree = computed(() => {
  return normalizeTree(props.permissionTree)
})

// ==================== 方法定义 ====================

/**
 * 标准化树形数据
 * @param {Array} list 原始数据
 * @returns {Array} 标准化后的数据
 */
function normalizeTree(list = []) {
  return list.map((item) => {
    const node = { ...item }
    if (isArray(node.children) && node.children.length > 0) {
      node.children = normalizeTree(node.children)
    }
    else {
      delete node.children
    }
    return node
  })
}

/**
 * 处理菜单选择
 * @param {Array} keys 选中的key
 */
const handleMenuCheck = (keys) => {
  formData.value.menuIds = keys
}

/**
 * 打开弹窗
 * @param {object} options 配置选项
 */
const handleOpen = async (options = {}) => {
  const { action, row = {}, ...rest } = options
  modalAction.value = action

  if (action === 'edit' && row.id) {
    // 编辑模式：获取详情数据
    try {
      const { data } = await getRoleById(row.id)
      const menuIds = data.menus?.map((menu) => menu.id) || []
      formData.value = {
        ...defaultForm,
        ...data,
        menuIds
      }
    }
    catch (error) {
      console.error('获取角色详情失败:', error)
      $message.error('获取角色详情失败')
      return
    }
  }
  else {
    // 新增模式：使用默认值
    formData.value = { ...defaultForm }
  }

  modalRef.value.open({
    ...rest,
    onOk: handleSave
  })
}

/**
 * 保存角色数据
 */
const handleSave = async () => {
  await validation()
  okLoading.value = true

  try {
    const submitData = {
      name: formData.value.name,
      value: formData.value.value,
      status: formData.value.status,
      remark: formData.value.remark,
      menuIds: formData.value.menuIds
    }

    if (modalAction.value === 'add') {
      await createRole(submitData)
    }
    else if (modalAction.value === 'edit') {
      await updateRole(formData.value.id, submitData)
    }

    $message.success('保存成功')
    emit('refresh')
  }
  catch (error) {
    console.error('保存角色失败:', error)
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

<style scoped>
.menu-tree {
  width: 100%;
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px;
}
</style>
