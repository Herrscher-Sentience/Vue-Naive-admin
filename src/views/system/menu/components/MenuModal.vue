<template>
  <BasicModal ref="modalRef">
    <n-form
      ref="modalFormRef"
      :label-width="130"
      :model="modalForm"
      label-placement="left"
      require-mark-placement="left"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="24" path="parentId">
          <template #label>
            <QuestionLabel content="上级菜单" label="上级菜单" />
          </template>
          <template v-if="modalForm.menuType === MENU_TYPE.DIRECTORY">
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

        <n-form-item-gi :span="24" path="menuType">
          <template #label>
            <QuestionLabel content="菜单类型" label="菜单类型" />
          </template>
          <n-radio-group v-model:value="modalForm.menuType">
            <n-radio :value="MENU_TYPE.DIRECTORY">
              目录
            </n-radio>
            <n-radio :value="MENU_TYPE.MENU">
              菜单
            </n-radio>
            <n-radio :value="MENU_TYPE.BUTTON">
              按钮
            </n-radio>
          </n-radio-group>
        </n-form-item-gi>

        <n-form-item-gi v-if="modalForm.menuType !== MENU_TYPE.BUTTON" :span="12" path="icon">
          <template #label>
            <QuestionLabel
              content="如material-symbols:help，图标库地址: https://icones.js.org/collection/all"
              label="菜单图标"
            />
          </template>
          <n-popover
            v-model:show="iconSelectorVisible"
            trigger="click"
            placement="bottom-start"
            :show-arrow="false"
            style="padding: 0;"
          >
            <template #trigger>
              <n-input
                v-model:value="modalForm.icon"
                placeholder="点击选择图标"
                readonly
              >
                <template #suffix>
                  <i v-if="modalForm.icon" :class="`${modalForm.icon} text-18`" />
                </template>
              </n-input>
            </template>
            <div class="w-600px max-h-350px p-16">
              <n-input
                v-model:value="iconSearch"
                placeholder="搜索图标..."
                clearable
                class="mb-12px"
              >
                <template #prefix>
                  <i class="i-fe:search text-16" />
                </template>
              </n-input>
              <div class="grid grid-cols-[repeat(10,minmax(0,1fr))] gap-12px max-h-280px overflow-y-auto">
                <div
                  v-for="icon in filteredIcons"
                  :key="icon"
                  class="flex items-center justify-center h-48px rounded-8px cursor-pointer transition-all-200ms border border-transparent hover:bg-#f0f0f0 hover:border-#d0d0d0"
                  :class="{ 'bg-#e6f7ff! border-#1890ff!': modalForm.icon === icon }"
                  @click="selectIcon(icon)"
                >
                  <i :class="`${icon} text-24`" />
                </div>
              </div>
              <div class="mt-12px pt-12px border-t border-#f0f0f0">
                <span class="text-gray">共 {{ filteredIcons.length }} 个图标</span>
              </div>
            </div>
          </n-popover>
        </n-form-item-gi>
        <n-form-item-gi :span="12" path="orderNum">
          <template #label>
            <QuestionLabel content="显示排序" label="显示排序" />
          </template>
          <n-input-number v-model:value="modalForm.orderNum" />
        </n-form-item-gi>

        <n-form-item-gi :span="12" path="menuName">
          <template #label>
            <QuestionLabel content="菜单名称" label="菜单名称" />
          </template>
          <n-input v-model:value="modalForm.menuName" placeholder="请输入菜单名称" />
        </n-form-item-gi>
        <n-form-item-gi v-if="modalForm.menuType === MENU_TYPE.MENU" :span="12" path="routeName">
          <template #label>
            <QuestionLabel content="路由名称" label="路由名称" />
          </template>
          <n-input v-model:value="modalForm.routeName" placeholder="路由名称" />
        </n-form-item-gi>

        <n-form-item-gi v-if="modalForm.menuType !== MENU_TYPE.BUTTON" :span="12" path="isFrame">
          <template #label>
            <QuestionLabel content="是否外链" label="是否外链" />
          </template>
          <n-radio-group v-model:value="modalForm.isFrame">
            <n-radio :value="1">
              是
            </n-radio>
            <n-radio :value="0">
              否
            </n-radio>
          </n-radio-group>
        </n-form-item-gi>
        <n-form-item-gi v-if="modalForm.menuType !== MENU_TYPE.BUTTON" :span="12" path="path">
          <template #label>
            <QuestionLabel content="路由地址" label="路由地址" />
          </template>
          <n-input v-model:value="modalForm.path" placeholder="/dashboard" />
        </n-form-item-gi>

        <n-form-item-gi v-if="modalForm.menuType === MENU_TYPE.MENU" :span="12" path="component">
          <template #label>
            <QuestionLabel content="组件路径" label="组件路径" />
          </template>
          <n-input v-model:value="modalForm.component" placeholder="组件路径" />
        </n-form-item-gi>
        <n-form-item-gi v-if="modalForm.menuType !== MENU_TYPE.DIRECTORY" :span="12" path="perms">
          <template #label>
            <QuestionLabel content="权限字符" label="权限字符" />
          </template>
          <n-input v-model:value="modalForm.perms" placeholder="权限字符" />
        </n-form-item-gi>

        <!-- 第七排：路由参数和是否缓存 -->
        <n-form-item-gi v-if="modalForm.menuType === MENU_TYPE.MENU" :span="12" path="query">
          <template #label>
            <QuestionLabel content="路由参数" label="路由参数" />
          </template>
          <n-input v-model:value="modalForm.query" placeholder="路由参数" />
        </n-form-item-gi>
        <n-form-item-gi v-if="modalForm.menuType === MENU_TYPE.MENU" :span="12" path="isCache">
          <template #label>
            <QuestionLabel content="是否缓存" label="是否缓存" />
          </template>
          <n-radio-group v-model:value="modalForm.isCache">
            <n-radio :value="1">
              缓存
            </n-radio>
            <n-radio :value="0">
              不缓存
            </n-radio>
          </n-radio-group>
        </n-form-item-gi>

        <n-form-item-gi v-if="modalForm.menuType !== MENU_TYPE.BUTTON" :span="12" path="visible">
          <template #label>
            <QuestionLabel content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" label="显示状态" />
          </template>
          <n-radio-group v-model:value="modalForm.visible">
            <n-radio :value="1">
              显示
            </n-radio>
            <n-radio :value="0">
              隐藏
            </n-radio>
          </n-radio-group>
        </n-form-item-gi>
        <n-form-item-gi :span="12" path="status">
          <template #label>
            <QuestionLabel content="选择停用则路由将不会出现在侧边栏，也不能被访问" label="菜单状态" />
          </template>
          <n-radio-group v-model:value="modalForm.status">
            <n-radio :value="1">
              正常
            </n-radio>
            <n-radio :value="0">
              禁用
            </n-radio>
          </n-radio-group>
        </n-form-item-gi>
      </n-grid>
    </n-form>
  </BasicModal>
</template>

<script setup>
import icons from 'isme:icons'
import { computed, ref, watch } from 'vue'
import { BasicModal } from '@/components/BasicModal'
import { useForm, useModal } from '@/composables'
import { isArray, isNumber } from '@/utils'
import { addPermission, savePermission } from '@/views/system/menu/api.js'
import QuestionLabel from './QuestionLabel.vue'

const props = defineProps({
  menus: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refresh'])

// 常量定义
const MENU_TYPE = {
  DIRECTORY: 'M',
  MENU: 'C',
  BUTTON: 'F'
}

const defaultForm = {
  menuName: '',
  parentId: null,
  menuType: MENU_TYPE.DIRECTORY,
  icon: '',
  orderNum: 10,
  isFrame: 0,
  path: '/dashboard',
  routeName: '',
  component: '',
  perms: '',
  query: '',
  visible: 1,
  status: 1,
  isCache: 0
}

const iconSelectorVisible = ref(false)
const iconSearch = ref('')

// 图标过滤 - 使用缓存优化性能
const filteredIcons = computed(() => {
  if (!iconSearch.value)
    return icons
  const search = iconSearch.value.toLowerCase()
  return icons.filter((icon) => icon.toLowerCase().includes(search))
})

const selectIcon = (icon) => {
  modalForm.value.icon = icon
  iconSelectorVisible.value = false
}

const menuTreeOptions = ref([])
const modalAction = ref('')
const [modalFormRef, modalForm, validation] = useForm()
const [modalRef, okLoading] = useModal()

// 将菜单数据转换为树形选择器所需的格式
const normalizeMenuTree = (list = []) => {
  return list.map((item) => {
    const node = {
      label: item.menuName,
      value: item.id,
      key: item.id
    }
    if (isArray(item.children) && item.children.length > 0) {
      node.children = normalizeMenuTree(item.children)
    }
    return node
  })
}

const handleOpen = (options = {}) => {
  const { action, row = {}, ...rest } = options
  modalAction.value = action

  modalForm.value = { ...defaultForm, ...row }

  modalRef.value.open({ ...rest, onOk: onSave })
}

const onSave = async () => {
  await validation()
  okLoading.value = true
  try {
    let newFormData
    const formData = { ...modalForm.value }

    // 确保 orderNum 是整数
    if (!isNumber(formData.orderNum)) {
      formData.orderNum = Number.parseInt(formData.orderNum) || 0
    }

    // 一级菜单（目录）的 parentId 设置为 0
    if (formData.menuType === MENU_TYPE.DIRECTORY) {
      formData.parentId = 0
    }
    else if (!formData.parentId) {
      formData.parentId = null
    }

    // 将 visible 和 status 转换为字符串类型（数据库字段类型）
    // 前端: visible 1=显示, 0=隐藏 | 数据库: visible '0'=显示, '1'=隐藏
    if (formData.visible !== undefined) {
      formData.visible = formData.visible === 1 ? '0' : '1'
    }
    // 前端: status 1=正常, 0=禁用 | 数据库: status '0'=正常, '1'=停用
    if (formData.status !== undefined) {
      formData.status = formData.status === 1 ? '0' : '1'
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

watch(
  () => props.menus,
  (val) => {
    menuTreeOptions.value = normalizeMenuTree(val)
  },
  { immediate: true, deep: true }
)

defineExpose({
  handleOpen
})
</script>

<style scoped></style>
