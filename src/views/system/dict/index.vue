<template>
  <CommonPage>
    <template #action>
      <NButton v-permission="'sys:dict:save'" type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        新增字典
      </NButton>
    </template>

    <BasicCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="1000"
      :columns="columns"
      :get-data="dict.read"
    >
      <BasicQueryItem label="字典名称" :label-width="80">
        <n-input
          v-model:value="queryItems.dictName"
          type="text"
          placeholder="请输入字典名称"
          clearable
        />
      </BasicQueryItem>

      <BasicQueryItem label="字典类型" :label-width="80">
        <n-input
          v-model:value="queryItems.dictType"
          type="text"
          placeholder="请输入字典类型"
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
          label="字典名称"
          path="dictName"
          :rule="{
            required: true,
            message: '请输入字典名称',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.dictName" />
        </n-form-item>

        <n-form-item
          label="字典类型"
          path="dictType"
          :rule="{
            required: true,
            message: '请输入字典类型',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.dictType" :disabled="modalAction === 'edit'" />
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
import { dict } from '@/api'
import { BasicCrud, BasicModal, BasicQueryItem } from '@/components/Table'
import { useCrud } from '@/composables'
import { formatDateTime } from '@/utils'

defineOptions({ name: 'DictMgt' })

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
  name: '字典',
  initForm: { status: 1, sort: 0 },
  doCreate: dict.create,
  doDelete: dict.delete,
  doUpdate: dict.update,
  refresh: () => $table.value?.handleSearch()
})

const columns = [
  { title: '字典名称', key: 'dictName', width: 150, ellipsis: { tooltip: true } },
  { title: '字典类型', key: 'dictType', width: 150 },
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
            onClick: () => handleOpen({ action: 'edit', title: '编辑字典', row, onOk: handleSave })
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
