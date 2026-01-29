<template>
  <CommonPage>
    <template #action>
      <NButton v-permission="'sys:dept:save'" type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        新增部门
      </NButton>
    </template>

    <BasicCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="1000"
      :columns="columns"
      :get-data="dept.read"
      :tree="true"
    >
      <BasicQueryItem label="部门名称" :label-width="80">
        <n-input
          v-model:value="queryItems.deptName"
          type="text"
          placeholder="请输入部门名称"
          clearable
        />
      </BasicQueryItem>

      <BasicQueryItem label="状态" :label-width="50">
        <n-select
          v-model:value="queryItems.status"
          clearable
          :options="[
            { label: '启用', value: 1 },
            { label: '停用', value: 0 },
          ]"
        />
      </BasicQueryItem>
    </BasicCrud>

    <BasicModal ref="modalRef" width="520px">
      <n-form
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :label-width="80"
        :model="modalForm"
        :disabled="modalAction === 'view'"
      >
        <n-form-item
          label="上级部门"
          path="pid"
        >
          <n-tree-select
            v-model:value="modalForm.pid"
            :options="deptTreeData"
            key-field="id"
            label-field="name"
            clearable
            placeholder="请选择上级部门"
          />
        </n-form-item>

        <n-form-item
          label="部门名称"
          path="name"
          :rule="{
            required: true,
            message: '请输入部门名称',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.name" />
        </n-form-item>

        <n-form-item
          label="排序"
          path="sort"
          :rule="{
            required: true,
            message: '请输入排序',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input-number v-model:value="modalForm.sort" :min="0" />
        </n-form-item>

        <n-form-item
          label="备注"
          path="remark"
        >
          <n-input
            v-model:value="modalForm.remark"
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
          />
        </n-form-item>

        <n-form-item label="状态" path="status">
          <NSwitch v-model:value="modalForm.status">
            <template #checked>
              启用
            </template>
            <template #unchecked>
              停用
            </template>
          </NSwitch>
        </n-form-item>
      </n-form>
    </BasicModal>
  </CommonPage>
</template>

<script setup>
import { NButton, NSwitch, NTag } from 'naive-ui'
import { dept } from '@/api'
import { BasicCrud, BasicModal, BasicQueryItem } from '@/components/Table'
import { useCrud } from '@/composables'
import { formatDateTime } from '@/utils'

defineOptions({ name: 'DeptMgt' })

const $table = ref(null)
const queryItems = ref({})
const deptTreeData = ref([])

onMounted(() => {
  $table.value?.handleSearch()
  loadDeptTree()
})

async function loadDeptTree() {
  const { data } = await dept.read()
  deptTreeData.value = data || []
}

const {
  modalForm,
  modalAction,
  handleAdd,
  handleDelete,
  handleOpen,
  handleSave
} = useCrud({
  name: '部门',
  initForm: { pid: '0', status: 1, sort: 0 },
  doCreate: dept.create,
  doDelete: dept.delete,
  doUpdate: dept.update,
  refresh: () => $table.value?.handleSearch()
})

const columns = [
  { title: '部门名称', key: 'name', width: 200, ellipsis: { tooltip: true } },
  { title: '排序', key: 'sort', width: 80 },
  { title: '备注', key: 'remark', width: 200, ellipsis: { tooltip: true } },
  {
    title: '创建时间',
    key: 'createDate',
    width: 180,
    render(row) {
      return h('span', formatDateTime(row.createDate))
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) =>
      h(
        NTag,
        { type: row.status === 1 ? 'success' : 'error' },
        { default: () => row.status === 1 ? '启用' : '停用' }
      )
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    align: 'right',
    fixed: 'right',
    hideInExcel: true,
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            secondary: true,
            onClick: () => handleOpen({ action: 'edit', title: '编辑部门', row, onOk: handleSave })
          },
          {
            default: () => '编辑',
            icon: () => h('i', { class: 'i-material-symbols:edit-outline text-14' })
          }
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            style: 'margin-left: 12px;',
            onClick: () => handleDelete(row.id)
          },
          {
            default: () => '删除',
            icon: () => h('i', { class: 'i-material-symbols:delete-outline text-14' })
          }
        )
      ]
    }
  }
]
</script>
