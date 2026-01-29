<template>
  <CommonPage>
    <template #action>
      <NButton v-permission="'sys:params:save'" type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        新增参数
      </NButton>
      <NButton v-permission="'sys:params:export'" type="default" @click="handleExport">
        <i class="i-material-symbols:download mr-4 text-18" />
        导出
      </NButton>
    </template>

    <BasicCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="1000"
      :columns="columns"
      :get-data="params.read"
    >
      <BasicQueryItem label="参数名称" :label-width="80">
        <n-input
          v-model:value="queryItems.paramName"
          type="text"
          placeholder="请输入参数名称"
          clearable
        />
      </BasicQueryItem>

      <BasicQueryItem label="参数键名" :label-width="80">
        <n-input
          v-model:value="queryItems.paramKey"
          type="text"
          placeholder="请输入参数键名"
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
          label="参数名称"
          path="paramName"
          :rule="{
            required: true,
            message: '请输入参数名称',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.paramName" />
        </n-form-item>

        <n-form-item
          label="参数键名"
          path="paramKey"
          :rule="{
            required: true,
            message: '请输入参数键名',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.paramKey" :disabled="modalAction === 'edit'" />
        </n-form-item>

        <n-form-item
          label="参数键值"
          path="paramValue"
          :rule="{
            required: true,
            message: '请输入参数键值',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.paramValue" />
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
import { params } from '@/api'
import { BasicCrud, BasicModal, BasicQueryItem } from '@/components/Table'
import { useCrud } from '@/composables'
import { formatDateTime } from '@/utils'

defineOptions({ name: 'ParamsMgt' })

const $table = ref(null)
const queryItems = ref({})

onMounted(() => {
  $table.value?.handleSearch()
})

const {
  modalForm,
  modalAction,
  handleAdd,
  handleDelete,
  handleOpen,
  handleSave
} = useCrud({
  name: '参数',
  initForm: { status: 1 },
  doCreate: params.create,
  doDelete: params.delete,
  doUpdate: params.update,
  refresh: () => $table.value?.handleSearch()
})

async function handleExport() {
  try {
    const res = await params.export(queryItems.value)
    const blob = new Blob([res], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `参数配置_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    $message.success('导出成功')
  }
  catch (error) {
    $message.error('导出失败')
  }
}

const columns = [
  { title: '参数名称', key: 'paramName', width: 150, ellipsis: { tooltip: true } },
  { title: '参数键名', key: 'paramKey', width: 200, ellipsis: { tooltip: true } },
  { title: '参数键值', key: 'paramValue', width: 200, ellipsis: { tooltip: true } },
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
            onClick: () => handleOpen({ action: 'edit', title: '编辑参数', row, onOk: handleSave })
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
