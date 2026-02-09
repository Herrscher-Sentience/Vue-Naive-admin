<template>
  <CommonPage>
    <div class="flex flex-col overflow-hidden">
      <!-- 顶部操作栏 -->
      <div class="shrink-0 mb-12">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <n-input v-model:value="pattern" clearable placeholder="搜索" class="w-240 mr-12" />
            <NButton class="mr-8" size="small" @click="expandAll">
              <i class="i-material-symbols:unfold-more mr-4 text-14" />
              展开全部
            </NButton>
            <NButton class="mr-12" size="small" @click="collapseAll">
              <i class="i-material-symbols:unfold-less mr-4 text-14" />
              折叠全部
            </NButton>
            <NButton type="primary" @click="handleAdd()">
              <i class="i-material-symbols:add mr-4 text-14" />
              新增
            </NButton>
          </div>
        </div>
      </div>

      <!-- 菜单表格 -->
      <div class="flex-1">
        <n-data-table
          :columns="columns"
          :data="normalizedTreeData"
          :row-key="rowKey"
          :expanded-row-keys="expandedKeys"
          :row-props="rowProps"
          size="small"
          :scroll-x="1000"
          max-height="65vh"
          bordered
          striped
          :single-line="false"
          @update:expanded-row-keys="onUpdateExpandedKeys"
        />
      </div>
    </div>

    <ResAddOrEdit ref="modalRef" :menus="treeData" @refresh="initData" />
  </CommonPage>
</template>

<script setup>
import { NButton, NDropdown, NIcon } from 'naive-ui'
import { onMounted, ref, watch } from 'vue'
import { CommonPage } from '@/components/CommonPage/index.js'
import { deletePermission, getMenuList } from '@/views/system/menu/api.js'
import ResAddOrEdit from '@/views/system/menu/components/ResAddOrEdit.vue'

const treeData = ref([])
const pattern = ref('')
const expandedKeys = ref([])
const normalizedTreeData = ref([])
const allExpandKeys = ref([])
const modalRef = ref(null)

const rowKey = (row) => row.id

function normalizeTree(list = []) {
  return list.map((item) => {
    const node = { ...item }

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

    if (Array.isArray(node.children) && node.children.length > 0) {
      node.children = normalizeTree(node.children)
    }
    else {
      delete node.children
    }

    return node
  })
}

function collectExpandKeys(list = [], keys = []) {
  list.forEach((item) => {
    if (item.children && item.children.length) {
      keys.push(item.id)
      collectExpandKeys(item.children, keys)
    }
  })
  return keys
}

watch(
  () => treeData.value,
  (val) => {
    const normalized = normalizeTree(val)
    normalizedTreeData.value = normalized
    allExpandKeys.value = collectExpandKeys(normalized)
    // 默认折叠所有节点
    expandedKeys.value = []
  },
  { immediate: true }
)

/* ---------- 展开/折叠全部 ---------- */

const expandAll = () => {
  expandedKeys.value = [...allExpandKeys.value]
}

const collapseAll = () => {
  expandedKeys.value = []
}

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
        DIRECTORY: '目录',
        MENU: '菜单',
        BUTTON: '按钮'
      }
      return typeMap[row.type] ?? '--'
    }
  },
  {
    title: '菜单图标',
    key: 'icon',
    width: 80,
    align: 'center',
    render: (row) => {
      if (!row.icon) {
        return '--'
      }
      return h('div', { class: 'flex items-center justify-center' }, [
        h('i', { class: `${row.icon} text-18` })
      ])
    }
  },
  {
    title: '前端组件',
    key: 'component',
    width: 220,
    ellipsis: {
      tooltip: true
    },
    render: (row) => row.component || '--'
  },
  {
    title: '菜单路径',
    key: 'path',
    width: 200,
    ellipsis: {
      tooltip: true
    },
    render: (row) => row.path || '--'
  },
  {
    title: '排序',
    key: 'orderNo',
    width: 80,
    render: (row) => row.orderNo ?? '--'
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
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
            trigger: 'hover',
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

const rowProps = () => {
  return {
    style: {
      cursor: 'pointer'
    }
  }
}

const onUpdateExpandedKeys = (keys) => {
  expandedKeys.value = keys
}

/* ---------- 数据初始化 ---------- */

const initData = async () => {
  const { data: result } = await getMenuList()
  treeData.value = result || []
}

onMounted(() => {
  initData()
})

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
  modalRef.value?.handleOpen({
    action: 'edit',
    title: `编辑菜单 - ${row.name}`,
    row,
    okText: '保存'
  })
}

const handleDelete = (item) => {
  console.log(
    item
  )

  $dialog.confirm({
    content: `确认删除【${item.name}】？`,
    async confirm() {
      await deletePermission(item.id)
      initData()
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
