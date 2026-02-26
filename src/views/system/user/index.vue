<template>
  <CommonPage>
    <template #action>
      <NButton type="primary" @click="handleAdd">
        <i class="i-material-symbols:add mr-4 text-18" />
        新增用户
      </NButton>
    </template>

    <BasicTable
      ref="tableRef"
      v-model:query-items="queryItems"
      :columns="columns"
      :get-data="getUserList"
      :scroll-x="1400"
    >
      <BasicQuery label="用户名" :label-width="60">
        <n-input
          v-model:value="queryItems.search"
          clearable
          placeholder="请输入用户名"
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

    <UserModal
      ref="modalRef"
      :roles="roles"
      @refresh="refreshTable"
    />
  </CommonPage>
</template>

<script setup>
import { NAvatar, NButton, NSwitch, NTag } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { BasicQuery } from '@/components/BasicQuery'
import { BasicTable } from '@/components/BasicTable'
import { CommonPage } from '@/components/CommonPage'
import { formatDateTime } from '@/utils'
import { getAllRoles, getUserList, updateUser } from './api'
import UserModal from './components/UserModal.vue'

defineOptions({ name: 'UserManagement' })

// ==================== 常量定义 ====================
const STATUS_OPTIONS = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]

// ==================== 响应式状态 ====================
const tableRef = ref(null)
const modalRef = ref(null)
const queryItems = ref({})
const roles = ref([])

// ==================== 配置项 ====================
const statusOptions = STATUS_OPTIONS

// ==================== 表格列配置 ====================
const columns = [
  {
    title: '头像',
    key: 'avatar',
    width: 80,
    align: 'center',
    render: (row) =>
      h(NAvatar, {
        size: 40,
        src: row.avatar,
        round: true
      })
  },
  {
    title: '用户名',
    key: 'userName',
    width: 120,
    ellipsis: { tooltip: true }
  },
  {
    title: '昵称',
    key: 'nickName',
    width: 120,
    ellipsis: { tooltip: true },
    render: (row) => row.nickName || '--'
  },
  {
    title: '角色',
    key: 'roles',
    width: 200,
    ellipsis: { tooltip: true },
    render: (row) => {
      if (row.roles?.length) {
        return row.roles.map((item, index) =>
          h(
            NTag,
            { type: 'info', size: 'small', style: index > 0 ? 'margin-left: 4px;' : '' },
            { default: () => item.name }
          )
        )
      }
      return '--'
    }
  },
  {
    title: '邮箱',
    key: 'email',
    width: 180,
    ellipsis: { tooltip: true },
    render: (row) => row.email || '--'
  },
  {
    title: '手机号',
    key: 'phonenumber',
    width: 120,
    render: (row) => row.phonenumber || '--'
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 180,
    render: (row) => formatDateTime(row.createTime)
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center',
    render: (row) => {
      // admin用户不允许修改状态
      if (row.userName === 'admin') {
        return h(NTag, { type: 'success', size: 'small' }, { default: () => '正常' })
      }
      return h(
        NSwitch,
        {
          size: 'small',
          rubberBand: false,
          value: row.status === '0',
          loading: !!row.statusLoading,
          onUpdateValue: () => handleStatusChange(row)
        },
        {
          checked: () => '正常',
          unchecked: () => '停用'
        }
      )
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    align: 'right',
    fixed: 'right',
    render: (row) => {
      const isAdmin = row.userName === 'admin'
      return h('div', { class: 'flex items-center justify-end gap-8' }, [
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
            type: 'info',
            text: true,
            onClick: () => handleAssignRole(row)
          },
          { default: () => '分配角色' }
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            text: true,
            disabled: isAdmin,
            onClick: () => handleDelete(row)
          },
          { default: () => '删除' }
        )
      ])
    }
  }
]

// ==================== 事件处理函数 ====================

/** 新增用户 */
const handleAdd = () => {
  modalRef.value?.handleOpen({
    action: 'add',
    title: '新增用户'
  })
}

/** 编辑用户 */
const handleEdit = (row) => {
  modalRef.value?.handleOpen({
    action: 'edit',
    title: `编辑用户 - ${row.userName}`,
    row
  })
}

/** 分配角色 */
const handleAssignRole = (row) => {
  const roleIds = row.roles?.map((item) => item.id) || []
  modalRef.value?.handleOpen({
    action: 'assignRole',
    title: `分配角色 - ${row.userName}`,
    row: { ...row, roleIds }
  })
}

/** 删除用户 */
const handleDelete = (row) => {
  $dialog.confirm({
    content: `确认删除用户【${row.userName}】？删除后不可恢复。`,
    async confirm() {
      try {
        // 注意：后端目前没有删除用户接口，这里需要后端补充
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
    const newStatus = row.status === '0' ? '1' : '0'
    await updateUser({ id: row.id, status: newStatus })
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

/** 初始化角色列表 */
const initRoles = async () => {
  try {
    const { data } = await getAllRoles()
    roles.value = data || []
  }
  catch (error) {
    console.error('获取角色列表失败:', error)
    roles.value = []
  }
}

// ==================== 生命周期 ====================

onMounted(() => {
  tableRef.value?.handleSearch()
  initRoles()
})
</script>
