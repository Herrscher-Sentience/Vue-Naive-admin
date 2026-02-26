<template>
  <BasicModal ref="modalRef">
    <n-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-width="120"
      label-placement="left"
      require-mark-placement="left"
    >
      <n-grid :cols="24" :x-gap="24">
        <!-- 上级菜单 -->
        <n-form-item-gi :span="24" path="parentId" label="上级菜单">
          <template v-if="formData.menuType === MENU_TYPE.DIRECTORY">
            <n-input value="主类目" disabled />
          </template>
          <n-tree-select
            v-else
            v-model:value="formData.parentId"
            :options="menuTreeOptions"
            clearable
            placeholder="请选择上级菜单"
          />
        </n-form-item-gi>

        <!-- 菜单类型 -->
        <n-form-item-gi :span="24" path="menuType" label="菜单类型">
          <n-radio-group v-model:value="formData.menuType">
            <n-radio-button :value="MENU_TYPE.DIRECTORY">
              目录
            </n-radio-button>
            <n-radio-button :value="MENU_TYPE.MENU">
              菜单
            </n-radio-button>
            <n-radio-button :value="MENU_TYPE.BUTTON">
              按钮
            </n-radio-button>
          </n-radio-group>
        </n-form-item-gi>

        <!-- 菜单名称 -->
        <n-form-item-gi :span="12" path="menuName" label="菜单名称">
          <n-input v-model:value="formData.menuName" placeholder="请输入菜单名称" maxlength="50" />
        </n-form-item-gi>

        <!-- 显示排序 -->
        <n-form-item-gi :span="12" path="orderNum" label="显示排序">
          <n-input-number
            v-model:value="formData.orderNum"
            :min="0"
            :max="9999"
            placeholder="数值越小越靠前"
            class="w-full"
          />
        </n-form-item-gi>

        <!-- 菜单图标（非按钮类型显示） -->
        <n-form-item-gi v-if="formData.menuType !== MENU_TYPE.BUTTON" :span="12" path="icon" label="菜单图标">
          <n-popover
            v-model:show="iconSelectorVisible"
            trigger="click"
            placement="bottom-start"
            :show-arrow="false"
            style="padding: 0"
          >
            <template #trigger>
              <n-input
                v-model:value="formData.icon"
                placeholder="点击选择图标"
                readonly
                maxlength="100"
              >
                <template #suffix>
                  <i v-if="formData.icon" :class="`${formData.icon} text-18`" />
                </template>
              </n-input>
            </template>
            <div class="icon-selector">
              <n-input
                v-model:value="iconSearch"
                placeholder="搜索图标..."
                clearable
                class="mb-12"
              >
                <template #prefix>
                  <i class="i-fe:search text-16" />
                </template>
              </n-input>
              <div class="icon-grid">
                <div
                  v-for="icon in filteredIcons"
                  :key="icon"
                  class="icon-item"
                  :class="{ 'icon-item--active': formData.icon === icon }"
                  @click="handleSelectIcon(icon)"
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

        <!-- 路由路径（非按钮类型显示） -->
        <n-form-item-gi
          v-if="formData.menuType !== MENU_TYPE.BUTTON"
          :span="12"
          path="path"
          label="路由路径"
        >
          <n-input
            v-model:value="formData.path"
            placeholder="如：/system/menu"
            maxlength="200"
          />
        </n-form-item-gi>

        <!-- 组件路径（菜单类型显示） -->
        <n-form-item-gi
          v-if="formData.menuType === MENU_TYPE.MENU"
          :span="12"
          path="component"
          label="组件路径"
        >
          <n-input
            v-model:value="formData.component"
            placeholder="如：system/menu/index"
            maxlength="255"
          />
        </n-form-item-gi>

        <!-- 路由名称（菜单类型显示） -->
        <n-form-item-gi
          v-if="formData.menuType === MENU_TYPE.MENU"
          :span="12"
          path="routeName"
          label="路由名称"
        >
          <n-input
            v-model:value="formData.routeName"
            placeholder="路由名称（唯一标识）"
            maxlength="50"
          />
        </n-form-item-gi>

        <!-- 权限标识（非目录类型显示） -->
        <n-form-item-gi
          v-if="formData.menuType !== MENU_TYPE.DIRECTORY"
          :span="12"
          path="perms"
          label="权限标识"
        >
          <n-input
            v-model:value="formData.perms"
            placeholder="如：system:menu:list"
            maxlength="100"
          />
        </n-form-item-gi>

        <!-- 路由参数（菜单类型显示） -->
        <n-form-item-gi
          v-if="formData.menuType === MENU_TYPE.MENU"
          :span="12"
          path="query"
          label="路由参数"
        >
          <n-input
            v-model:value="formData.query"
            placeholder="路由参数"
            maxlength="255"
          />
        </n-form-item-gi>

        <!-- 是否外链（非按钮类型显示） -->
        <n-form-item-gi
          v-if="formData.menuType !== MENU_TYPE.BUTTON"
          :span="12"
          path="isFrame"
          label="是否外链"
        >
          <n-radio-group v-model:value="formData.isFrame">
            <n-radio :value="0">
              否
            </n-radio>
            <n-radio :value="1">
              是
            </n-radio>
          </n-radio-group>
        </n-form-item-gi>

        <!-- 是否缓存（菜单类型显示） -->
        <n-form-item-gi
          v-if="formData.menuType === MENU_TYPE.MENU"
          :span="12"
          path="isCache"
          label="是否缓存"
        >
          <n-radio-group v-model:value="formData.isCache">
            <n-radio :value="0">
              缓存
            </n-radio>
            <n-radio :value="1">
              不缓存
            </n-radio>
          </n-radio-group>
        </n-form-item-gi>

        <!-- 显示状态（非按钮类型显示） -->
        <n-form-item-gi
          v-if="formData.menuType !== MENU_TYPE.BUTTON"
          :span="12"
          path="visible"
          label="显示状态"
        >
          <n-radio-group v-model:value="formData.visible">
            <n-radio :value="1">
              显示
            </n-radio>
            <n-radio :value="0">
              隐藏
            </n-radio>
          </n-radio-group>
        </n-form-item-gi>

        <!-- 菜单状态 -->
        <n-form-item-gi :span="12" path="status" label="菜单状态">
          <n-radio-group v-model:value="formData.status">
            <n-radio :value="0">
              正常
            </n-radio>
            <n-radio :value="1">
              停用
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
import { isArray } from '@/utils'
import { createMenu, updateMenu } from '@/views/system/menu/api.js'

defineOptions({ name: 'MenuModal' })

const props = defineProps({
  menus: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refresh'])

// ==================== 常量定义 ====================
const MENU_TYPE = {
  DIRECTORY: 'M',
  MENU: 'C',
  BUTTON: 'F'
}

const DEFAULT_FORM = {
  menuName: '',
  parentId: null,
  menuType: MENU_TYPE.MENU,
  icon: '',
  orderNum: 0,
  isFrame: 0,
  path: '',
  routeName: '',
  component: '',
  perms: '',
  query: '',
  visible: 1, // 默认显示
  status: 0, // 默认正常
  isCache: 0
}

// ==================== 表单验证规则 ====================
const formRules = {
  menuName: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { max: 50, message: '菜单名称不能超过50个字符', trigger: 'blur' }
  ],
  path: [
    { max: 200, message: '路由路径不能超过200个字符', trigger: 'blur' }
  ],
  component: [
    { max: 255, message: '组件路径不能超过255个字符', trigger: 'blur' }
  ],
  perms: [
    { max: 100, message: '权限标识不能超过100个字符', trigger: 'blur' }
  ]
}

// ==================== 响应式状态 ====================
const iconSelectorVisible = ref(false)
const iconSearch = ref('')
const menuTreeOptions = ref([])
const modalAction = ref('')

const [formRef, formData, validation] = useForm()
const [modalRef, okLoading] = useModal()

// ==================== 计算属性 ====================

/** 过滤后的图标列表 */
const filteredIcons = computed(() => {
  if (!iconSearch.value)
    return icons
  const search = iconSearch.value.toLowerCase()
  return icons.filter((icon) => icon.toLowerCase().includes(search))
})

// ==================== 方法定义 ====================

/**
 * 选择图标
 * @param {string} icon 图标名称
 */
const handleSelectIcon = (icon) => {
  formData.value.icon = icon
  iconSelectorVisible.value = false
}

/**
 * 将菜单数据转换为树形选择器格式
 * @param {Array} list 菜单列表
 * @returns {Array} 树形选择器数据
 */
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

/**
 * 打开弹窗
 * @param {object} options 配置选项
 */
const handleOpen = (options = {}) => {
  const { action, row = {}, ...rest } = options
  modalAction.value = action

  // 合并默认值和传入的数据
  formData.value = { ...DEFAULT_FORM, ...row }

  modalRef.value.open({
    ...rest,
    onOk: handleSave
  })
}

/**
 * 保存菜单数据
 */
const handleSave = async () => {
  await validation()
  okLoading.value = true

  try {
    const submitData = { ...formData.value }

    // 目录类型的父级ID设为0，否则默认为0（后端会自动转换类型）
    if (submitData.menuType === MENU_TYPE.DIRECTORY) {
      submitData.parentId = 0
    }
    else if (!submitData.parentId) {
      submitData.parentId = 0
    }

    if (modalAction.value === 'add') {
      await createMenu(submitData)
    }
    else if (modalAction.value === 'edit') {
      await updateMenu(submitData.id, submitData)
    }

    $message.success('保存成功')
    emit('refresh')
  }
  catch (error) {
    console.error('保存菜单失败:', error)
    $message.error(error.message || '保存失败')
    return false
  }
  finally {
    okLoading.value = false
  }
}

// ==================== 监听器 ====================

watch(
  () => props.menus,
  (val) => {
    menuTreeOptions.value = normalizeMenuTree(val)
  },
  { immediate: true, deep: true }
)

// ==================== 暴露方法 ====================

defineExpose({
  handleOpen
})
</script>

<style scoped>
.icon-selector {
  width: 600px;
  max-height: 400px;
  padding: 16px;
}

.icon-grid {
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
  border: 1px solid transparent;
  transition: all 0.2s;
}

.icon-item:hover {
  background-color: #f0f0f0;
  border-color: #d0d0d0;
}

.icon-item--active {
  background-color: #e6f7ff;
  border-color: #1890ff;
}

.icon-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.w-full {
  width: 100%;
}
</style>
