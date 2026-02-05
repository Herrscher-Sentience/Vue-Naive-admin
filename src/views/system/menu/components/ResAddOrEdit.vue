<template>
  <BasicModal ref="modalRef" width="1000px">
    <n-tabs v-model:value="activeTab" type="segment" animated>
      <n-tab-pane name="0" tab="一级菜单">
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
            <n-form-item-gi :span="12" path="url">
              <template #label>
                <QuestionLabel content="菜单路径" label="菜单路径" />
              </template>
              <n-input v-model:value="modalForm.url" placeholder="/dashboard" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="component">
              <template #label>
                <QuestionLabel content="前端组件" label="前端组件" />
              </template>
              <n-select
                v-model:value="modalForm.component"
                :options="componentOptions"
                clearable
                filterable
                tag
                placeholder="layouts/default/index"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="componentName">
              <template #label>
                <QuestionLabel content="组件名称" label="组件名称" />
              </template>
              <n-input v-model:value="modalForm.componentName" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="redirect">
              <template #label>
                <QuestionLabel content="默认跳转地址" label="默认跳转地址" />
              </template>
              <n-input v-model:value="modalForm.redirect" placeholder="/dashboard/analysis" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="customIcon">
              <template #label>
                <QuestionLabel content="上传自定义图标" label="自定义菜单图标" />
              </template>
              <n-upload
                v-model:file-list="modalForm.customIconList"
                :max="1"
                accept="image/*"
                list-type="image-card"
                :custom-request="handleUpload"
                @remove="handleRemoveIcon"
              >
                点击上传
              </n-upload>
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
            <n-form-item-gi :span="12" path="sortNo">
              <template #label>
                <QuestionLabel content="排序" label="排序" />
              </template>
              <n-input-number v-model:value="modalForm.sortNo" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="isRoute">
              <template #label>
                <QuestionLabel content="是否路由菜单" label="是否路由菜单" />
              </template>
              <n-switch v-model:value="modalForm.isRoute">
                <template #checked>
                  是
                </template>
                <template #unchecked>
                  否
                </template>
              </n-switch>
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="hidden">
              <template #label>
                <QuestionLabel content="隐藏路由" label="隐藏路由" />
              </template>
              <n-switch v-model:value="modalForm.hidden">
                <template #checked>
                  隐藏
                </template>
                <template #unchecked>
                  显示
                </template>
              </n-switch>
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="hideTab">
              <template #label>
                <QuestionLabel content="隐藏Tab" label="隐藏Tab" />
              </template>
              <n-switch v-model:value="modalForm.hideTab">
                <template #checked>
                  隐藏
                </template>
                <template #unchecked>
                  显示
                </template>
              </n-switch>
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="keepAlive">
              <template #label>
                <QuestionLabel content="是否缓存路由" label="是否缓存路由" />
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
            <n-form-item-gi :span="12" path="alwaysShow">
              <template #label>
                <QuestionLabel content="聚合路由" label="聚合路由" />
              </template>
              <n-switch v-model:value="modalForm.alwaysShow">
                <template #checked>
                  是
                </template>
                <template #unchecked>
                  否
                </template>
              </n-switch>
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="internalOrExternal">
              <template #label>
                <QuestionLabel content="打开方式" label="打开方式" />
              </template>
              <n-switch v-model:value="modalForm.internalOrExternal">
                <template #checked>
                  外部
                </template>
                <template #unchecked>
                  内部
                </template>
              </n-switch>
            </n-form-item-gi>
          </n-grid>
        </n-form>
      </n-tab-pane>
      <n-tab-pane name="1" tab="子菜单">
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
              <n-tree-select
                v-model:value="modalForm.parentId"
                :options="menuTreeOptions"
                clearable
                placeholder="请选择上级菜单"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="url">
              <template #label>
                <QuestionLabel content="菜单路径" label="菜单路径" />
              </template>
              <n-input v-model:value="modalForm.url" placeholder="/dashboard" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="component">
              <template #label>
                <QuestionLabel content="前端组件" label="前端组件" />
              </template>
              <n-select
                v-model:value="modalForm.component"
                :options="componentOptions"
                clearable
                filterable
                tag
                placeholder="layouts/default/index"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="componentName">
              <template #label>
                <QuestionLabel content="组件名称" label="组件名称" />
              </template>
              <n-input v-model:value="modalForm.componentName" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="customIcon">
              <template #label>
                <QuestionLabel content="上传自定义图标" label="自定义菜单图标" />
              </template>
              <n-upload
                v-model:file-list="modalForm.customIconList"
                :max="1"
                accept="image/*"
                list-type="image-card"
                :custom-request="handleUpload"
                @remove="handleRemoveIcon"
              >
                点击上传
              </n-upload>
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
            <n-form-item-gi :span="12" path="sortNo">
              <template #label>
                <QuestionLabel content="排序" label="排序" />
              </template>
              <n-input-number v-model:value="modalForm.sortNo" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="isRoute">
              <template #label>
                <QuestionLabel content="是否路由菜单" label="是否路由菜单" />
              </template>
              <n-switch v-model:value="modalForm.isRoute">
                <template #checked>
                  是
                </template>
                <template #unchecked>
                  否
                </template>
              </n-switch>
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="hidden">
              <template #label>
                <QuestionLabel content="隐藏路由" label="隐藏路由" />
              </template>
              <n-switch v-model:value="modalForm.hidden">
                <template #checked>
                  隐藏
                </template>
                <template #unchecked>
                  显示
                </template>
              </n-switch>
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="hideTab">
              <template #label>
                <QuestionLabel content="隐藏Tab" label="隐藏Tab" />
              </template>
              <n-switch v-model:value="modalForm.hideTab">
                <template #checked>
                  隐藏
                </template>
                <template #unchecked>
                  显示
                </template>
              </n-switch>
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="keepAlive">
              <template #label>
                <QuestionLabel content="是否缓存路由" label="是否缓存路由" />
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
            <n-form-item-gi :span="12" path="alwaysShow">
              <template #label>
                <QuestionLabel content="聚合路由" label="聚合路由" />
              </template>
              <n-switch v-model:value="modalForm.alwaysShow">
                <template #checked>
                  是
                </template>
                <template #unchecked>
                  否
                </template>
              </n-switch>
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="internalOrExternal">
              <template #label>
                <QuestionLabel content="打开方式" label="打开方式" />
              </template>
              <n-switch v-model:value="modalForm.internalOrExternal">
                <template #checked>
                  外部
                </template>
                <template #unchecked>
                  内部
                </template>
              </n-switch>
            </n-form-item-gi>
          </n-grid>
        </n-form>
      </n-tab-pane>
      <n-tab-pane name="2" tab="按钮权限">
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
                <QuestionLabel content="按钮/权限" label="按钮/权限" />
              </template>
              <n-input v-model:value="modalForm.name" placeholder="请输入按钮/权限名称" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="parentId">
              <template #label>
                <QuestionLabel content="上级菜单" label="上级菜单" />
              </template>
              <n-tree-select
                v-model:value="modalForm.parentId"
                :options="menuTreeOptions"
                clearable
                placeholder="请选择上级菜单"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="url">
              <template #label>
                <QuestionLabel content="菜单路径" label="菜单路径" />
              </template>
              <n-input v-model:value="modalForm.url" placeholder="/dashboard" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="customIcon">
              <template #label>
                <QuestionLabel content="上传自定义图标" label="自定义菜单图标" />
              </template>
              <n-upload
                v-model:file-list="modalForm.customIconList"
                :max="1"
                accept="image/*"
                list-type="image-card"
                :custom-request="handleUpload"
                @remove="handleRemoveIcon"
              >
                点击上传
              </n-upload>
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="perms">
              <template #label>
                <QuestionLabel content="授权标识" label="授权标识" />
              </template>
              <n-input v-model:value="modalForm.perms" placeholder="请输入授权标识" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="permsType">
              <template #label>
                <QuestionLabel content="授权策略" label="授权策略" />
              </template>
              <n-select
                v-model:value="modalForm.permsType"
                :options="permsTypeOptions"
                placeholder="请选择授权策略"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="visible">
              <template #label>
                <QuestionLabel content="可见/可访问" label="可见/可访问" />
              </template>
              <n-switch v-model:value="modalForm.visible">
                <template #checked>
                  可见
                </template>
                <template #unchecked>
                  不可见
                </template>
              </n-switch>
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="editable">
              <template #label>
                <QuestionLabel content="可编辑" label="可编辑" />
              </template>
              <n-switch v-model:value="modalForm.editable">
                <template #checked>
                  可编辑
                </template>
                <template #unchecked>
                  不可编辑
                </template>
              </n-switch>
            </n-form-item-gi>
            <n-form-item-gi :span="12" path="status">
              <template #label>
                <QuestionLabel content="状态" label="状态" />
              </template>
              <n-radio-group v-model:value="modalForm.status">
                <n-radio value="1">
                  有效
                </n-radio>
                <n-radio value="0">
                  无效
                </n-radio>
              </n-radio-group>
            </n-form-item-gi>
          </n-grid>
        </n-form>
      </n-tab-pane>
    </n-tabs>
  </BasicModal>
</template>

<script setup>
import icons from 'isme:icons'
import pagePathes from 'isme:page-pathes'
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

const componentOptions = pagePathes.map((path) => ({ label: path, value: path }))
const iconOptions = icons.map((item) => ({
  label: () =>
    h('span', { class: 'flex items-center' }, [h('i', { class: `${item} text-18 mr-8` }), item]),
  value: item
}))
const permsTypeOptions = [
  { label: '可见', value: '0' },
  { label: '可访问', value: '1' }
]

const activeTab = ref('0')

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
  status: '1',
  hidden: false,
  layout: '',
  menuType: 0,
  keepAlive: false,
  isLeaf: false,
  hideTab: false,
  alwaysShow: false,
  internalOrExternal: false,
  isRoute: true,
  sortNo: 10,
  permsType: '0',
  url: '/dashboard',
  component: 'layouts/default/index',
  redirect: '',
  icon: '',
  customIcon: '',
  customIconList: [],
  name: '',
  parentId: null,
  perms: '',
  visible: true,
  editable: true
}

const [modalFormRef, modalForm, validation] = useForm()
const [modalRef, okLoading] = useModal()

const modalAction = ref('')

function handleOpen(options = {}) {
  const { action, row = {}, ...rest } = options
  modalAction.value = action

  modalForm.value = { ...defaultForm, ...row }

  // 将数字转换为布尔值，确保 n-switch 组件正确工作
  const booleanFields = ['hidden', 'alwaysShow', 'isLeaf', 'keepAlive', 'hideTab', 'visible', 'editable']
  booleanFields.forEach((key) => {
    if (typeof modalForm.value[key] === 'number') {
      modalForm.value[key] = modalForm.value[key] === 1
    }
  })

  // isRoute 和 internalOrExternal 在 DTO 中定义为数字类型，但也转换为布尔值用于显示
  if (typeof modalForm.value.isRoute === 'number') {
    modalForm.value.isRoute = modalForm.value.isRoute === 1
  }
  if (typeof modalForm.value.internalOrExternal === 'number') {
    modalForm.value.internalOrExternal = modalForm.value.internalOrExternal === 1
  }

  // 设置当前标签页
  if (row.menuType !== undefined) {
    activeTab.value = String(row.menuType)
  }
  else {
    activeTab.value = '0'
  }

  if (row.customIcon) {
    modalForm.value.customIconList = [{
      id: 'custom',
      name: 'custom-icon',
      status: 'finished',
      url: row.customIcon
    }]
  }
  modalRef.value.open({ ...rest, onOk: onSave })
}

function handleUpload({ file, onFinish, onError }) {
  // 这里可以替换为实际的文件上传API
  // 模拟上传成功
  const reader = new FileReader()
  reader.onload = (e) => {
    modalForm.value.customIcon = e.target.result
    onFinish()
  }
  reader.onerror = () => {
    onError()
  }
  reader.readAsDataURL(file.file)
}

function handleRemoveIcon() {
  modalForm.value.customIcon = ''
}

async function onSave() {
  console.log(modalForm.value)

  await validation()
  okLoading.value = true
  try {
    let newFormData
    if (!modalForm.value.parentId)
      modalForm.value.parentId = null

    // 转换布尔值为数字
    const formData = { ...modalForm.value }
    const numberFields = ['isRoute', 'internalOrExternal', 'hidden', 'alwaysShow', 'isLeaf', 'keepAlive', 'hideTab', 'visible', 'editable']
    numberFields.forEach((key) => {
      if (typeof formData[key] === 'boolean') {
        formData[key] = formData[key] ? 1 : 0
      }
    })

    // 设置 menuType
    formData.menuType = Number.parseInt(activeTab.value)

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
