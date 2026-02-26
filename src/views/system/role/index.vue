<template>
  <CommonPage>
    <template #action>
      <NButton type="primary" @click="handleAdd">
        <i class="i-material-symbols:add mr-4 text-18" />
        新增角色
      </NButton>
    </template>

    <BasicTable
      ref="tableRef"
      v-model:query-items="queryItems"
      :columns="columns"
      :get-data="getRolePage"
      :scroll-x="1200"
    >
      <BasicQuery label="角色名" :label-width="60">
        <n-input
          v-model:value="queryItems.name"
          clearable
          placeholder="请输入角色名"
        />
      </BasicQuery>
      <BasicQuery label="状态" :label-width="60">
        <NSelect
          v-model:value="queryItems.status"
          :options="statusOptions"
          clearable
          placeholder="请选择状态"
        />
      </BasicQuery>
    </BasicTable>

    <RoleModal
      ref="modalRef"
      :permission-tree="permissionTree"
      @refresh="refreshTable"
    />
  </CommonPage>
</template>

<script setup>
import { NButton, NSelect, NSwitch, NTag } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { BasicQuery } from '@/components/BasicQuery'
import { BasicTable } from '@/components/BasicTable'
import { CommonPage } from '@/components/CommonPage'
import { getMenuList } from '@/views/system/menu/api.js'
import { deleteRole, getRolePage, updateRole } from './api'
import RoleModal from './components/RoleModal.vue'

defineOptions({ name: 'RoleManagement' })

// ==================== 常量定义 ====================
const STATUS_OPTIONS = [
  { label: '启用', value: '1' },
  { label: '停用', value: '0' }
]

// ==================== 响应式状态 ====================
const tableRef = ref(null)
const modalRef = ref(null)
const queryItems = ref({})
const permissionTree = ref([])

// ==================== 配置项 ====================
const statusOptions = STATUS_OPTIONS

// ==================== 表格列配置 ====================
const columns = [
  {
    title: '角色名称',
    key: 'name',
    width: 150,
    ellipsis: { tooltip: true }
  },
  {
    title: '角色值',
    key: 'value',
    width: 150,
    ellipsis: { tooltip: true }
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center',
    render: (row) => {
      if (row.value === 'admin') {
        return h(NTag, { type: 'success', size: 'small' }, { default: () => '启用' })
      }
      return h(
        NSwitch,
        {
          size: 'small',
          rubberBand: false,
          value: row.status === '1',
          loading: !!row.statusLoading,
          onUpdateValue: () => handleStatusChange(row)
        },
        {
          checked: () => '启用',
          unchecked: () => '停用'
        }
      )
    }
  },
  {
    title: '备注',
    key: 'remark',
    width: 200,
    ellipsis: { tooltip: true },
    render: (row) => row.remark || '--'
  },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    align: 'center',
    fixed: 'right',
    render: (row) => {
      const isSuperAdmin = row.value === 'admin'
      return h('div', { class: 'flex items-center justify-center gap-12' }, [
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
          NButton,
          {
            size: 'small',
            type: 'error',
            text: true,
            disabled: isSuperAdmin,
            onClick: () => handleDelete(row)
          },
          { default: () => '删除' }
        )
      ])
    }
  }
]

/** 新增角色 */
const handleAdd = () => {
  modalRef.value?.handleOpen({
    action: 'add',
    title: '新增角色'
  })
}

/** 编辑角色 */
const handleEdit = async (row) => {
  modalRef.value?.handleOpen({
    action: 'edit',
    title: `编辑角色 - ${row.name}`,
    row
  })
}

/** 删除角色 */
const handleDelete = (row) => {
  $dialog.confirm({
    content: `确认删除角色【${row.name}】？删除后不可恢复。`,
    async confirm() {
      try {
        await deleteRole(row.id)
        $message.success('删除成功')
        refreshTable()
      }
      catch (error) {
        $message.error(error.message || '删除失败')
      }
    }
  })
}

/** 状态切换 */
const handleStatusChange = async (row) => {
  row.statusLoading = true
  try {
    const newStatus = row.status === '1' ? '0' : '1'
    await updateRole(row.id, { status: newStatus })
    $message.success('状态更新成功')
    refreshTable()
  }
  catch (error) {
    $message.error(error.message || '状态更新失败')
  }
  finally {
    row.statusLoading = false
  }
}

/** 刷新表格 */
const refreshTable = (keepCurrentPage = false) => {
  tableRef.value?.handleSearch(keepCurrentPage)
}

/** 初始化权限树 */
const initPermissionTree = async () => {
  try {
    const { data: result } = await getMenuList()
    permissionTree.value = result || []
  }
  catch (error) {
    console.error('获取菜单树失败:', error)
    permissionTree.value = []
  }
}

// ==================== 生命周期 ====================

onMounted(() => {
  tableRef.value?.handleSearch()
  initPermissionTree()
})
</script>
