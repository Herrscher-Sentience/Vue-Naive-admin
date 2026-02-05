<template>
  <div class="flex flex-col h-full">
    <div class="shrink-0">
      <h3 class="mb-12">
        菜单
      </h3>
      <div class="flex items-center justify-between">
        <n-input v-model:value="pattern" clearable placeholder="搜索" class="w-160 mr-12" />
        <div class="flex items-center">
          <NButton class="mr-12" size="small" @click="toggleExpandAll">
            <i :class="isAllExpanded ? 'i-material-symbols:unfold-less' : 'i-material-symbols:unfold-more'" class="mr-4 text-14" />
            {{ isAllExpanded ? '折叠全部' : '展开全部' }}
          </NButton>
          <NButton type="primary" @click="handleAdd()">
            <i class="i-material-symbols:add mr-4 text-14" />
            新增
          </NButton>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-auto mt-12">
      <n-data-table
        :columns="columns"
        :data="normalizedTreeData"
        :row-key="rowKey"
        :expanded-row-keys="expandedKeys"
        :row-props="rowProps"
        size="small"
        :scroll-x="800"
        @update:expanded-row-keys="onUpdateExpandedKeys"
      />
    </div>

    <ResAddOrEdit ref="modalRef" :menus="treeData" @refresh="(data) => emit('refresh', data)" />
  </div>
</template>

<script setup>
import { NButton, NDropdown, NIcon } from 'naive-ui'
import { computed, h, ref, watch, withModifiers } from 'vue'
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
const allExpandKeys = ref([])
const rowKey = (row) => row.id

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
    allExpandKeys.value = collectExpandKeys(normalized)
    // 默认只展开第一级节点
    expandedKeys.value = normalized
      .filter((item) => item.children && item.children.length > 0)
      .map((item) => item.id)
  },
  { immediate: true }
)

/* ---------- Tree 事件 ---------- */

const onUpdateExpandedKeys = (keys) => {
  expandedKeys.value = keys
}

/* ---------- 展开/折叠全部 ---------- */

const isAllExpanded = computed(() => {
  return expandedKeys.value.length === allExpandKeys.value.length && allExpandKeys.value.length > 0
})

const toggleExpandAll = () => {
  expandedKeys.value = isAllExpanded.value ? [] : [...allExpandKeys.value]
}

/* ---------- 表格列定义 ---------- */

const columns = [
  {
    title: '菜单名称',
    key: 'name',
    width: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '菜单类型',
    key: 'type',
    width: 100,
    render: (row) => {
      const typeMap = {
        MENU: '菜单',
        BUTTON: '按钮',
        DIR: '目录'
      }
      return typeMap[row.type] || row.type
    }
  },
  {
    title: '菜单图标',
    key: 'icon',
    width: 80,
    render: (row) => {
      if (!row.icon)
        return '--'
      return h('i', { class: `${row.icon} text-18` })
    }
  },
  {
    title: '前端组件',
    key: 'component',
    width: 200,
    ellipsis: {
      tooltip: true
    },
    render: (row) => row.component || '--'
  },
  {
    title: '菜单路径',
    key: 'url',
    width: 200,
    ellipsis: {
      tooltip: true
    },
    render: (row) => row.url || '--'
  },
  {
    title: '排序',
    key: 'sortNo',
    width: 80,
    render: (row) => row.sortNo ?? '--'
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    fixed: 'right',
    render: (row) => {
      return h('div', { class: 'flex' }, [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            text: true,
            onClick: () => handleEdit(row)
          },
          { default: () => '编辑' }
        ),
        h(
          NDropdown,
          {
            trigger: 'click',
            options: [
              {
                label: '添加下级',
                key: 'add',
                icon: () => h(NIcon, null, { default: () => h('i', { class: 'i-material-symbols:add text-16' }) })
              },
              {
                label: '删除',
                key: 'delete',
                icon: () => h(NIcon, null, { default: () => h('i', { class: 'i-material-symbols:delete text-16' }) })
              }
            ],
            onSelect: (key) => handleDropdownSelect(key, row)
          },
          {
            default: () =>
              h(
                NButton,
                {
                  size: 'small',
                  text: true,
                  style: 'margin-left: 8px;'
                },
                {
                  default: () => '更多',
                  icon: () => h(NIcon, null, { default: () => h('i', { class: 'i-material-symbols:expand-more text-16' }) })
                }
              )
          }
        )
      ])
    }
  }
]

const rowProps = (row) => {
  return {
    style: {
      cursor: 'pointer',
      backgroundColor: currentMenu?.id === row.id ? 'rgba(24, 160, 88, 0.1)' : ''
    },
    onClick: () => {
      emit('update:currentMenu', row)
    }
  }
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

const handleEdit = (row) => {
  emit('update:currentMenu', row)
  modalRef.value?.handleOpen({
    action: 'edit',
    title: `编辑菜单 - ${row.name}`,
    row,
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

const handleDropdownSelect = (key, row) => {
  if (key === 'add') {
    handleAdd({ parentId: row.id })
  }
  else if (key === 'delete') {
    handleDelete(row)
  }
}
</script>
