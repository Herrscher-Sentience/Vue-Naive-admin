<template>
  <BasicModal ref="modalRef" width="1000px">
    <n-form
      ref="modalFormRef"
      :label-width="130"
      :model="modalForm"
      label-placement="left"
      require-mark-placement="left"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" path="name">
          <template #label>
            <QuestionLabel content="菜单名称" label="菜单名称" />
          </template>
          <n-input v-model:value="modalForm.name" placeholder="请输入菜单名称" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" path="parentId">
          <template #label>
            <QuestionLabel content="上级菜单" label="上级菜单" />
          </template>
          <template v-if="modalForm.type === 0">
            <n-input value="主类目" disabled />
          </template>
          <n-tree-select
            v-else
            v-model:value="modalForm.parentId"
            :options="menuTreeOptions"
            clearable
            placeholder="请选择上级菜单"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" path="type">
          <template #label>
            <QuestionLabel content="菜单类型" label="菜单类型" />
          </template>
          <n-select
            v-model:value="modalForm.type"
            :options="menuTypeOptions"
            placeholder="请选择菜单类型"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" path="icon">
          <template #label>
            <QuestionLabel
              content="如material-symbols:help，图标库地址: https://icones.js.org/collection/all"
              label="菜单图标"
            />
          </template>
          <n-select v-model:value="modalForm.icon" :options="iconOptions" clearable filterable placeholder="ant-design:home-outlined" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" path="orderNo">
          <template #label>
            <QuestionLabel content="排序" label="排序" />
          </template>
          <n-input-number v-model:value="modalForm.orderNo" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" path="isFrame">
          <template #label>
            <QuestionLabel content="是否外链" label="是否外链" />
          </template>
          <n-switch v-model:value="modalForm.isFrame">
            <template #checked>
              是
            </template>
            <template #unchecked>
              否
            </template>
          </n-switch>
        </n-form-item-gi>
        <n-form-item-gi :span="12" path="path">
          <template #label>
            <QuestionLabel content="路由地址" label="路由地址" />
          </template>
          <n-input v-model:value="modalForm.path" placeholder="/dashboard" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" path="show">
          <template #label>
            <QuestionLabel content="显示状态" label="显示状态" />
          </template>
          <n-switch v-model:value="modalForm.show">
            <template #checked>
              显示
            </template>
            <template #unchecked>
              隐藏
            </template>
          </n-switch>
        </n-form-item-gi>
        <n-form-item-gi :span="12" path="status">
          <template #label>
            <QuestionLabel content="菜单状态" label="菜单状态" />
          </template>
          <n-switch v-model:value="modalForm.status">
            <template #checked>
              正常
            </template>
            <template #unchecked>
              禁用
            </template>
          </n-switch>
        </n-form-item-gi>
        <n-form-item-gi :span="12" path="keepAlive">
          <template #label>
            <QuestionLabel content="是否缓存" label="是否缓存" />
          </template>
          <n-switch v-model:value="modalForm.keepAlive">
            <template #checked>
              缓存
            </template>
            <template #unchecked>
              不缓存
            </template>
          </n-switch>
        </n-form-item-gi>
      </n-grid>
    </n-form>
  </BasicModal>
</template>

<script setup>
import icons from 'isme:icons'
import { h, watch } from 'vue'
import { BasicModal } from '@/components/BasicModal'
import { useForm, useModal } from '@/composables'
import { addPermission, savePermission } from '@/views/system/menu/api.js'
import QuestionLabel from './QuestionLabel.vue'

const props = defineProps({
  menus: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refresh'])

const iconOptions = icons.map((item) => ({
  label: () =>
    h('span', { class: 'flex items-center' }, [h('i', { class: `${item} text-18 mr-8` }), item]),
  value: item
}))

const menuTypeOptions = [
  { label: '目录', value: 0 },
  { label: '菜单', value: 1 },
  { label: '按钮', value: 2 }
]

const menuTreeOptions = ref([])

// 将菜单数据转换为 n-tree-select 需要的格式
function normalizeMenuTree(list = []) {
  return list.map((item) => {
    const node = {
      label: item.name,
      value: item.id,
      key: item.id
    }
    if (Array.isArray(item.children) && item.children.length > 0) {
      node.children = normalizeMenuTree(item.children)
    }
    return node
  })
}

// 监听 menus prop 的变化，更新 menuTreeOptions
watch(
  () => props.menus,
  (val) => {
    menuTreeOptions.value = normalizeMenuTree(val)
  },
  { immediate: true, deep: true }
)

const defaultForm = {
  name: '',
  parentId: null,
  type: 1,
  icon: '',
  orderNo: 10,
  isFrame: false,
  path: '/dashboard',
  show: true,
  status: true,
  keepAlive: false
}

const [modalFormRef, modalForm, validation] = useForm()
const [modalRef, okLoading] = useModal()

const modalAction = ref('')

function handleOpen(options = {}) {
  const { action, row = {}, ...rest } = options
  modalAction.value = action

  modalForm.value = { ...defaultForm, ...row }
  console.log(modalForm.value)

  // 将数字转换为布尔值，确保 n-switch 组件正确工作
  const booleanFields = ['isFrame', 'show', 'status', 'keepAlive']
  booleanFields.forEach((key) => {
    if (typeof modalForm.value[key] === 'number') {
      modalForm.value[key] = modalForm.value[key] === 1
    }
  })

  modalRef.value.open({ ...rest, onOk: onSave })
}

async function onSave() {
  console.log(modalForm.value)

  await validation()
  okLoading.value = true
  try {
    let newFormData

    // 转换为后端字段名
    const formData = { ...modalForm.value }
    const numberFields = ['isFrame', 'show', 'status', 'keepAlive']
    numberFields.forEach((key) => {
      if (typeof formData[key] === 'boolean') {
        formData[key] = formData[key] ? 1 : 0
      }
    })

    // 确保 type 是整数
    if (typeof formData.type !== 'number') {
      formData.type = Number.parseInt(formData.type)
    }

    // 确保 orderNo 是整数
    if (typeof formData.orderNo !== 'number') {
      formData.orderNo = Number.parseInt(formData.orderNo) || 0
    }

    // 转换为后端字段名
    formData.menuName = formData.name
    formData.orderNum = formData.orderNo
    formData.isCache = formData.keepAlive === 1 ? 0 : 1 // keepAlive=1时isCache=0（缓存）
    formData.perms = formData.permission || ''
    formData.visible = formData.show === 1 ? 0 : 1 // show=1时visible=0（显示）

    // 一级菜单（目录）的 parentId 设置为 0
    if (formData.type === 0) {
      formData.parentId = 0
    }
    else if (!formData.parentId) {
      formData.parentId = null
    }

    if (modalAction.value === 'add') {
      const res = await addPermission(formData)
      newFormData = res.data
    }
    else if (modalAction.value === 'edit') {
      await savePermission(formData.id, formData)
    }
    okLoading.value = false
    $message.success('保存成功')
    emit('refresh', modalAction.value === 'add' ? newFormData : modalForm.value)
  }
  catch (error) {
    console.error(error)
    okLoading.value = false
    return false
  }
}

defineExpose({
  handleOpen
})
</script>
