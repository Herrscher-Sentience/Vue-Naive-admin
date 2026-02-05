<template>
  <div>
    <n-space :size="12" vertical>
      <h3>菜单</h3>
      <div class="flex">
        <n-input v-model:value="pattern" clearable placeholder="搜索" />
        <NButton class="ml-12" type="primary" @click="handleAdd()">
          <i class="i-material-symbols:add mr-4 text-14" />
          新增
        </NButton>
      </div>

      <n-tree
        :data="normalizedTreeData"
        :expanded-keys="expandedKeys"
        :on-update:expanded-keys="onUpdateExpandedKeys"
        :on-update:selected-keys="onSelect"
        :pattern="pattern"
        :render-prefix="renderPrefix"
        :render-suffix="renderSuffix"
        :selected-keys="[currentMenu?.id]"
        :show-irrelevant-nodes="false"
        block-line
        key-field="id"
        label-field="name"
      />
    </n-space>

    <ResAddOrEdit ref="modalRef" :menus="treeData" @refresh="(data) => emit('refresh', data)" />
  </div>
</template>

<script setup>
import { NButton } from 'naive-ui'
import { h, ref, watch, withModifiers } from 'vue'
import { deletePermission } from '@/views/system/menu/api.js'
import ResAddOrEdit from './ResAddOrEdit.vue'

/* ---------- props / emits ---------- */

const props = defineProps({
  treeData: {
    type: Array,
    default: () => []
  },
  currentMenu: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['refresh', 'update:currentMenu'])

/* ---------- 状态 ---------- */

const pattern = ref('')
const expandedKeys = ref([])
const modalRef = ref(null)
const normalizedTreeData = ref([])

/* ---------- 数字 → 布尔 ---------- */

const BOOLEAN_FIELDS = [
  'hidden',
  'alwaysShow',
  'isLeaf',
  'isRoute',
  'internalOrExternal',
  'keepAlive',
  'hideTab'
]

function normalizeTree(list = []) {
  return list.map((item) => {
    const node = { ...item }

    // 数字 → boolean
    const BOOLEAN_FIELDS = [
      'hidden',
      'alwaysShow',
      'isLeaf',
      'isRoute',
      'internalOrExternal',
      'keepAlive',
      'hideTab'
    ]

    BOOLEAN_FIELDS.forEach((key) => {
      if (typeof node[key] === 'number') {
        node[key] = node[key] === 1
      }
    })

    // ⭐ 核心逻辑
    if (Array.isArray(node.children) && node.children.length > 0) {
      node.children = normalizeTree(node.children)
    }
    else {
      // ❗ 不管 isLeaf 是多少，只要没子节点，就删
      delete node.children
    }

    return node
  })
}

/* ---------- 展开父节点（只看 normalize 后的数据） ---------- */

function collectExpandKeys(list = [], keys = []) {
  list.forEach((item) => {
    if (item.children && item.children.length) {
      keys.push(item.id)
      collectExpandKeys(item.children, keys)
    }
  })
  return keys
}

/* ---------- watch ---------- */

watch(
  () => props.treeData,
  (val) => {
    const normalized = normalizeTree(val)
    normalizedTreeData.value = normalized
    expandedKeys.value = collectExpandKeys(normalized)
  },
  { immediate: true }
)

/* ---------- Tree 事件 ---------- */

const onUpdateExpandedKeys = (keys) => {
  expandedKeys.value = keys
}

const onSelect = (keys, option, { action, node }) => {
  emit('update:currentMenu', action === 'select' ? node : null)
}

/* ---------- 操作 ---------- */

const handleAdd = (data = {}) => {
  modalRef.value?.handleOpen({
    action: 'add',
    title: '新增菜单',
    row: { type: 'MENU', ...data },
    okText: '保存'
  })
}

const handleDelete = (item) => {
  $dialog.confirm({
    content: `确认删除【${item.name}】？`,
    async confirm() {
      await deletePermission(item.id)
      emit('refresh')
      emit('update:currentMenu', null)
    }
  })
}

/* ---------- Tree 自定义渲染 ---------- */

const renderPrefix = ({ option }) => {
  if (!option.icon)
    return null
  return h('i', { class: `${option.icon} text-16` })
}

const renderSuffix = ({ option }) => [
  h(
    NButton,
    {
      text: true,
      size: 'tiny',
      onClick: withModifiers(() => handleAdd({ parentId: option.id }), ['stop'])
    },
    { default: () => '新增' }
  ),
  h(
    NButton,
    {
      text: true,
      size: 'tiny',
      type: 'error',
      style: 'margin-left: 8px;',
      onClick: withModifiers(() => handleDelete(option), ['stop'])
    },
    { default: () => '删除' }
  )
]
</script>
