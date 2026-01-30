<template>
  <BasicModal ref="modalRef">
    <n-form
      ref="modalFormRef"
      :label-width="100"
      :model="modalForm"
      label-placement="left"
      require-mark-placement="left"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" label="所属菜单" path="parentId">
          <n-tree-select
            v-model:value="modalForm.parentId"
            :disabled="parentIdDisabled"
            :options="menuOptions"
            clearable
            key-field="id"
            label-field="name"
            placeholder="根菜单"
          />
        </n-form-item-gi>
        <n-form-item-gi :rule="required" :span="12" path="name">
          <template #label>
            <QuestionLabel content="标题" label="名称" />
          </template>
          <n-input v-model:value="modalForm.name" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" path="perms">
          <template #label>
            <QuestionLabel content="如果是菜单则对应前端路由的name，使用大驼峰" label="编码" />
          </template>
          <n-input v-model:value="modalForm.perms" />
        </n-form-item-gi>
        <n-form-item-gi
          v-if="modalForm.type === 'MENU'"
          :rule="{
            trigger: ['blur', 'change'],
            type: 'string',
            message: '必须是/、http、https开头',
            validator(rule, value) {
              if (value) {
                return /\/|http|https/.test(value)
              }
              return true
            },
          }"
          :span="12"
          path="url"
        >
          <template #label>
            <QuestionLabel content="父级菜单可不填" label="路由地址" />
          </template>
          <n-input v-model:value="modalForm.path" />
        </n-form-item-gi>
        <n-form-item-gi v-if="modalForm.type === 'MENU'" :span="12" path="icon">
          <template #label>
            <QuestionLabel
              content="如material-symbols:help，图标库地址: https://icones.js.org/collection/all"
              label="菜单图标"
            />
          </template>
          <n-select v-model:value="modalForm.icon" :options="iconOptions" clearable filterable />
        </n-form-item-gi>
        <n-form-item-gi v-if="modalForm.type === 'MENU'" :span="12" path="layout">
          <template #label>
            <QuestionLabel
              content="对应layouts文件夹下的目录名, 为空则默认为 default"
              label="layout"
            />
          </template>
          <n-select v-model:value="modalForm.layout" :options="layoutOptions" clearable />
        </n-form-item-gi>
        <n-form-item-gi v-if="modalForm.type === 'MENU'" :span="24" path="component">
          <template #label>
            <QuestionLabel
              content="前端组件的路径，以 /src 开头，父级菜单可不填"
              label="组件路径"
            />
          </template>
          <n-select
            v-model:value="modalForm.component"
            :options="componentOptions"
            clearable
            filterable
            tag
          />
        </n-form-item-gi>

        <n-form-item-gi v-if="modalForm.type === 'MENU'" :span="12" path="show">
          <template #label>
            <QuestionLabel content="控制是否在菜单栏显示，不影响路由注册" label="显示状态" />
          </template>
          <n-switch v-model:value="modalForm.show">
            <template #checked>
              隐藏
            </template>
            <template #unchecked>
              显示
            </template>
          </n-switch>
        </n-form-item-gi>
        <n-form-item-gi :span="12" path="status">
          <template #label>
            <QuestionLabel
              content="如果是菜单，禁用后将不添加到路由表，无法进入此页面"
              label="状态"
            />
          </template>
          <n-switch :value="modalForm.status === '1'" @update:value="(val) => modalForm.status = val ? '1' : '0'">
            <template #checked>
              启用
            </template>
            <template #unchecked>
              禁用
            </template>
          </n-switch>
        </n-form-item-gi>
        <n-form-item-gi v-if="modalForm.type === 'MENU'" :span="12" path="keepAlive">
          <template #label>
            <QuestionLabel
              content="设置keepAlive需将组件的name设置成当前菜单的perms"
              label="KeepAlive"
            />
          </template>
          <n-switch v-model:value="modalForm.keepAlive">
            <template #checked>
              是
            </template>
            <template #unchecked>
              否
            </template>
          </n-switch>
        </n-form-item-gi>
        <n-form-item-gi
          v-if="modalForm.type === 'MENU'"
          :rule="{
            type: 'number',
            required: true,
            message: '此为必填项',
            trigger: ['blur', 'change'],
          }"
          :span="12"
          label="排序"
          path="sortNo"
        >
          <n-input-number v-model:value="modalForm.sortNo" />
        </n-form-item-gi>
      </n-grid>
    </n-form>
  </BasicModal>
</template>

<script setup>
import icons from 'isme:icons'
import pagePathes from 'isme:page-pathes'
import { BasicModal } from '@/components/BasicModal'
import { useForm, useModal } from '@/composables'
import { addPermission, savePermission } from '@/views/system/menu/api.js'
import QuestionLabel from './QuestionLabel.vue'

const props = defineProps({
  menus: {
    type: Array,
    required: true
  }
})
const emit = defineEmits(['refresh'])

const menuOptions = computed(() => {
  return [{ name: '根菜单', id: '', children: props.menus || [] }]
})
const componentOptions = pagePathes.map((path) => ({ label: path, value: path }))
const iconOptions = icons.map((item) => ({
  label: () =>
    h('span', { class: 'flex items-center' }, [h('i', { class: `${item} text-18 mr-8` }), item]),
  value: item
}))
const layoutOptions = [
  { label: '跟随系统', value: '' },
  { label: '简约-simple', value: 'simple' },
  { label: '通用-normal', value: 'normal' },
  { label: '全面-full', value: 'full' },
  { label: '空白-empty', value: 'empty' }
]
const required = {
  required: true,
  message: '此为必填项',
  trigger: ['blur', 'change']
}

const defaultForm = { status: '1', show: 0, layout: '' }
const [modalFormRef, modalForm, validation] = useForm()
const [modalRef, okLoading] = useModal()

const modalAction = ref('')
const parentIdDisabled = ref(false)

function handleOpen(options = {}) {
  const { action, row = {}, ...rest } = options
  modalAction.value = action
  modalForm.value = { ...defaultForm, ...row }
  parentIdDisabled.value = !!row.parentId && row.type === 'BUTTON'
  modalRef.value.open({ ...rest, onOk: onSave })
}

async function onSave() {
  await validation()
  okLoading.value = true
  try {
    let newFormData
    if (!modalForm.value.parentId)
      modalForm.value.parentId = null
    if (modalAction.value === 'add') {
      const res = await addPermission(modalForm.value)
      newFormData = res.data
    }
    else if (modalAction.value === 'edit') {
      await savePermission(modalForm.value.id, modalForm.value)
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
