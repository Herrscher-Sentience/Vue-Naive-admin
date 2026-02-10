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
          <template v-if="modalForm.menuType === 'M'">
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
            <n-radio value="M">
              目录
            </n-radio>
            <n-radio value="C">
              菜单
            </n-radio>
            <n-radio value="F">
              按钮
            </n-radio>
          </n-radio-group>
        </n-form-item-gi>

        <n-form-item-gi v-if="modalForm.menuType !== 'F'" :span="12" path="icon">
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
            <div class="icon-selector-popover">
              <n-input
                v-model:value="iconSearch"
                placeholder="搜索图标..."
                clearable
                class="mb-3"
              >
                <template #prefix>
                  <i class="i-fe:search text-16" />
                </template>
              </n-input>
              <div class="icon-selector-grid">
                <div
                  v-for="icon in filteredIcons"
                  :key="icon"
                  class="icon-item"
                  :class="{ selected: modalForm.icon === icon }"
                  @click="selectIcon(icon)"
                >
                  <i :class="`${icon} text-24`" />
                </div>
              </div>
              <div class="icon-footer">
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
        <n-form-item-gi v-if="modalForm.menuType === 'C'" :span="12" path="routeName">
          <template #label>
            <QuestionLabel content="路由名称" label="路由名称" />
          </template>
          <n-input v-model:value="modalForm.routeName" placeholder="路由名称" />
        </n-form-item-gi>

        <n-form-item-gi v-if="modalForm.menuType !== 'F'" :span="12" path="isFrame">
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
        <n-form-item-gi v-if="modalForm.menuType !== 'F'" :span="12" path="path">
          <template #label>
            <QuestionLabel content="路由地址" label="路由地址" />
          </template>
          <n-input v-model:value="modalForm.path" placeholder="/dashboard" />
        </n-form-item-gi>

        <n-form-item-gi v-if="modalForm.menuType === 'C'" :span="12" path="component">
          <template #label>
            <QuestionLabel content="组件路径" label="组件路径" />
          </template>
          <n-input v-model:value="modalForm.component" placeholder="组件路径" />
        </n-form-item-gi>
        <n-form-item-gi v-if="modalForm.menuType !== 'M'" :span="12" path="perms">
          <template #label>
            <QuestionLabel content="权限字符" label="权限字符" />
          </template>
          <n-input v-model:value="modalForm.perms" placeholder="权限字符" />
        </n-form-item-gi>

        <!-- 第七排：路由参数和是否缓存 -->
        <n-form-item-gi v-if="modalForm.menuType === 'C'" :span="12" path="query">
          <template #label>
            <QuestionLabel content="路由参数" label="路由参数" />
          </template>
          <n-input v-model:value="modalForm.query" placeholder="路由参数" />
        </n-form-item-gi>
        <n-form-item-gi v-if="modalForm.menuType === 'C'" :span="12" path="isCache">
          <template #label>
            <QuestionLabel content="是否缓存" label="是否缓存" />
          </template>
          <n-switch v-model:value="modalForm.isCache">
            <template #checked>
              缓存
            </template>
            <template #unchecked>
              不缓存
            </template>
          </n-switch>
        </n-form-item-gi>

        <n-form-item-gi v-if="modalForm.menuType !== 'F'" :span="12" path="visible">
          <template #label>
            <QuestionLabel content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" label="显示状态" />
          </template>
          <n-switch v-model:value="modalForm.visible">
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
            <QuestionLabel content="选择停用则路由将不会出现在侧边栏，也不能被访问" label="菜单状态" />
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
      </n-grid>
    </n-form>
  </BasicModal>
</template>

<script setup>
import icons from 'isme:icons'
import { computed, ref, watch } from 'vue'
import { BasicModal } from '@/components/BasicModal'
import { useForm, useModal } from '@/composables'
import { isArray, isBoolean, isNumber } from '@/utils'
import { addPermission, savePermission } from '@/views/system/menu/api.js'
import QuestionLabel from './QuestionLabel.vue'

const props = defineProps({
  menus: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refresh'])

const iconSelectorVisible = ref(false)
const iconSearch = ref('')

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

console.log('图标总数:', icons.length)
console.log('图标列表:', icons)

const defaultForm = {
  menuName: '',
  parentId: null,
  menuType: 'M',
  icon: '',
  orderNum: 10,
  isFrame: false,
  path: '/dashboard',
  routeName: '',
  component: '',
  perms: '',
  query: '',
  visible: true,
  status: true,
  isCache: false
}

const menuTreeOptions = ref([])
const modalAction = ref('')
const [modalFormRef, modalForm, validation] = useForm()
const [modalRef, okLoading] = useModal()

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
  console.log(modalForm.value)

  const booleanFields = ['isFrame', 'visible', 'status', 'isCache']
  booleanFields.forEach((key) => {
    if (isNumber(modalForm.value[key])) {
      modalForm.value[key] = modalForm.value[key] === 1
    }
  })

  modalRef.value.open({ ...rest, onOk: onSave })
}

const onSave = async () => {
  await validation()
  okLoading.value = true
  try {
    let newFormData
    const formData = { ...modalForm.value }
    const numberFields = ['isFrame', 'visible', 'status', 'isCache']
    numberFields.forEach((key) => {
      if (isBoolean(formData[key])) {
        formData[key] = formData[key] ? 1 : 0
      }
    })

    // 确保 orderNum 是整数
    if (!isNumber(formData.orderNum)) {
      formData.orderNum = Number.parseInt(formData.orderNum) || 0
    }

    // 一级菜单（目录）的 parentId 设置为 0
    if (formData.menuType === 'M') {
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

<style scoped>
.icon-selector-popover {
  width: 600px;
  max-height: 350px;
  padding: 16px;
}

.icon-selector-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 12px;
  max-height: 280px;
  overflow-y: auto;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.icon-item:hover {
  background-color: #f0f0f0;
  border-color: #d0d0d0;
}

.icon-item.selected {
  background-color: #e6f7ff;
  border-color: #1890ff;
}

.icon-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>
