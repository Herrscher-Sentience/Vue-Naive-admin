<template>
  <CommonPage>
    <div class="menu-container">
      <!-- 顶部操作栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <n-input
            v-model:value="searchKeyword"
            clearable
            placeholder="搜索菜单名称"
            class="search-input"
          >
            <template #prefix>
              <i class="i-fe:search text-16" />
            </template>
          </n-input>
          <NButton size="small" @click="handleExpandAll">
            <i class="i-material-symbols:unfold-more mr-4 text-14" />
            展开全部
          </NButton>
          <NButton size="small" @click="handleCollapseAll">
            <i class="i-material-symbols:unfold-less mr-4 text-14" />
            折叠全部
          </NButton>
        </div>
        <div class="toolbar-right">
          <NButton type="primary" @click="handleAdd()">
            <i class="i-material-symbols:add mr-4 text-14" />
            新增菜单
          </NButton>
        </div>
      </div>

      <!-- 菜单表格 -->
      <div class="table-wrapper">
        <n-data-table
          :columns="columns"
          :data="filteredTreeData"
          :row-key="rowKey"
          :expanded-row-keys="expandedKeys"
          :row-props="rowProps"
          size="small"
          :scroll-x="1200"
          max-height="calc(100vh - 280px)"
          bordered
          striped
          :single-line="false"
          @update:expanded-row-keys="onUpdateExpandedKeys"
        />
      </div>
    </div>

    <MenuModal ref="modalRef" :menus="treeData" @refresh="fetchMenuList" />
  </CommonPage>
</template>

<script setup>
import { NButton, NDropdown, NIcon, NTag } from 'naive-ui'
import { computed, h, onMounted, ref, watch } from 'vue'
import { CommonPage } from '@/components/CommonPage/index.js'
import { deleteMenu, getMenuList } from '@/views/system/menu/api.js'
import MenuModal from '@/views/system/menu/components/MenuModal.vue'

defineOptions({ name: 'MenuManagement' })

// ==================== 常量定义 ====================
const MENU_TYPE = {
  DIRECTORY: 'M',
  MENU: 'C',
  BUTTON: 'F'
}

const MENU_TYPE_MAP = {
  [MENU_TYPE.DIRECTORY]: { label: '目录', type: 'primary' },
  [MENU_TYPE.MENU]: { label: '菜单', type: 'info' },
  [MENU_TYPE.BUTTON]: { label: '按钮', type: 'warning' }
}

// ==================== 响应式状态 ====================
const treeData = ref([])
const searchKeyword = ref('')
const expandedKeys = ref([])
const allExpandKeys = ref([])
const modalRef = ref(null)
const loading = ref(false)

// ==================== 计算属性 ====================
const rowKey = (row) => row.id

/** 过滤后的树形数据 */
const filteredTreeData = computed(() => {
  if (!searchKeyword.value) {
    return normalizedTreeData.value
  }
  return filterTree(normalizedTreeData.value, searchKeyword.value.toLowerCase())
})

/** 标准化后的树形数据 */
const normalizedTreeData = computed(() => {
  return normalizeTree(treeData.value)
})

// ==================== 树形数据处理函数 ====================

/**
 * 标准化树形数据，移除空的children属性
 * @param {Array} list 原始数据
 * @returns {Array} 标准化后的数据
 */
function normalizeTree(list = []) {
  return list.map((item) => {
    const node = { ...item }
    if (Array.isArray(node.children) && node.children.length > 0) {
      node.children = normalizeTree(node.children)
    }
    else {
      delete node.children
    }
    return node
  })
}

/**
 * 收集所有可展开的节点key
 * @param {Array} list 树形数据
 * @param {Array} keys 收集的key数组
 * @returns {Array} 所有可展开的key
 */
function collectExpandKeys(list = [], keys = []) {
  list.forEach((item) => {
    if (item.children && item.children.length) {
      keys.push(item.id)
      collectExpandKeys(item.children, keys)
    }
  })
  return keys
}

/**
 * 根据关键词过滤树形数据
 * @param {Array} tree 树形数据
 * @param {string} keyword 搜索关键词
 * @returns {Array} 过滤后的数据
 */
function filterTree(tree, keyword) {
  const result = []
  for (const node of tree) {
    const matchSelf = node.menuName?.toLowerCase().includes(keyword)
    const filteredChildren = node.children ? filterTree(node.children, keyword) : []

    if (matchSelf || filteredChildren.length > 0) {
      result.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children
      })
    }
  }
  return result
}

// ==================== 表格配置 ====================

const columns = [
  {
    title: '菜单名称',
    key: 'menuName',
    width: 200,
    ellipsis: { tooltip: true }
  },
  {
    title: '菜单类型',
    key: 'menuType',
    width: 100,
    align: 'center',
    render: (row) => {
      const config = MENU_TYPE_MAP[row.menuType]
      if (!config)
        return '--'
      return h(NTag, { type: config.type, size: 'small' }, { default: () => config.label })
    }
  },
  {
    title: '图标',
    key: 'icon',
    width: 80,
    align: 'center',
    render: (row) => {
      if (!row.icon)
        return '--'
      return h('div', { class: 'flex items-center justify-center' }, [
        h('i', { class: `${row.icon} text-18` })
      ])
    }
  },
  {
    title: '路由路径',
    key: 'path',
    width: 180,
    ellipsis: { tooltip: true },
    render: (row) => row.path || '--'
  },
  {
    title: '组件路径',
    key: 'component',
    width: 200,
    ellipsis: { tooltip: true },
    render: (row) => row.component || '--'
  },
  {
    title: '权限标识',
    key: 'perms',
    width: 160,
    ellipsis: { tooltip: true },
    render: (row) => row.perms || '--'
  },
  {
    title: '排序',
    key: 'orderNum',
    width: 80,
    align: 'center',
    render: (row) => row.orderNum ?? 0
  },
  {
    title: '显示状态',
    key: 'visible',
    width: 100,
    align: 'center',
    render: (row) => {
      const visibleMap = {
        0: { label: '隐藏', type: 'warning' },
        1: { label: '显示', type: 'success' }
      }
      const config = visibleMap[row.visible] ?? visibleMap[1]
      return h(NTag, { type: config.type, size: 'small' }, { default: () => config.label })
    }
  },
  {
    title: '菜单状态',
    key: 'status',
    width: 100,
    align: 'center',
    render: (row) => {
      const statusMap = {
        0: { label: '正常', type: 'success' },
        1: { label: '停用', type: 'error' }
      }
      const config = statusMap[row.status] ?? statusMap[0]
      return h(NTag, { type: config.type, size: 'small' }, { default: () => config.label })
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    fixed: 'right',
    render: (row) => {
      return h('div', { class: 'flex items-center gap-8' }, [
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
            options: getDropdownOptions(row),
            onSelect: (key) => handleDropdownSelect(key, row)
          },
          {
            default: () =>
              h(
                NButton,
                { size: 'small', text: true },
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

/**
 * 获取下拉菜单选项
 * @param {object} row 当前行数据
 * @returns {Array} 下拉选项
 */
function getDropdownOptions(_row) {
  const options = [
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
  ]
  return options
}

const rowProps = () => ({
  style: { cursor: 'pointer' }
})

const onUpdateExpandedKeys = (keys) => {
  expandedKeys.value = keys
}

// ==================== 事件处理函数 ====================

/** 展开全部 */
const handleExpandAll = () => {
  expandedKeys.value = [...allExpandKeys.value]
}

/** 折叠全部 */
const handleCollapseAll = () => {
  expandedKeys.value = []
}

/** 新增菜单 */
const handleAdd = (data = {}) => {
  modalRef.value?.handleOpen({
    action: 'add',
    title: '新增菜单',
    row: { menuType: MENU_TYPE.MENU, ...data },
    okText: '保存'
  })
}

/** 编辑菜单 */
const handleEdit = (row) => {
  modalRef.value?.handleOpen({
    action: 'edit',
    title: `编辑菜单 - ${row.menuName}`,
    row,
    okText: '保存'
  })
}

/** 删除菜单 */
const handleDelete = (row) => {
  $dialog.confirm({
    content: `确认删除菜单【${row.menuName}】？删除后将同时删除所有子菜单，此操作不可恢复。`,
    async confirm() {
      try {
        await deleteMenu(row.id)
        $message.success('删除成功')
        await fetchMenuList()
      }
      catch (error) {
        $message.error(error.message || '删除失败')
      }
    }
  })
}

/** 下拉菜单选择处理 */
const handleDropdownSelect = (key, row) => {
  switch (key) {
    case 'add':
      handleAdd({ parentId: row.id })
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

// ==================== 数据请求 ====================

/** 获取菜单列表 */
const fetchMenuList = async () => {
  loading.value = true
  try {
    const { data: result } = await getMenuList()
    treeData.value = result || []
  }
  catch (error) {
    $message.error(error.message || '获取菜单列表失败')
    treeData.value = []
  }
  finally {
    loading.value = false
  }
}

// ==================== 监听器 ====================

watch(
  () => treeData.value,
  () => {
    allExpandKeys.value = collectExpandKeys(normalizedTreeData.value)
  },
  { immediate: true, deep: true }
)

// ==================== 生命周期 ====================

onMounted(() => {
  fetchMenuList()
})
</script>

<style scoped>
.menu-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 240px;
}

.table-wrapper {
  flex: 1;
  overflow: auto;
}
</style>
