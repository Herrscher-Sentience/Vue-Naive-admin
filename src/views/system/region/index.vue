<template>
  <CommonPage>
    <template #action>
      <NButton v-permission="'sys:region:save'" type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        新增区域
      </NButton>
    </template>

    <BasicCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="1000"
      :columns="columns"
      :get-data="region.read"
      :tree="true"
    >
      <BasicQueryItem label="区域名称" :label-width="80">
        <n-input
          v-model:value="queryItems.name"
          type="text"
          placeholder="请输入区域名称"
          clearable
        />
      </BasicQueryItem>

      <BasicQueryItem label="区域代码" :label-width="80">
        <n-input
          v-model:value="queryItems.code"
          type="text"
          placeholder="请输入区域代码"
          clearable
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
          label="上级区域"
          path="pid"
        >
          <n-tree-select
            v-model:value="modalForm.pid"
            :options="regionTreeData"
            key-field="id"
            label-field="name"
            clearable
            placeholder="请选择上级区域"
          />
        </n-form-item>

        <n-form-item
          label="区域名称"
          path="name"
          :rule="{
            required: true,
            message: '请输入区域名称',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.name" />
        </n-form-item>

        <n-form-item
          label="区域代码"
          path="code"
          :rule="{
            required: true,
            message: '请输入区域代码',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.code" />
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
      </n-form>
    </BasicModal>
  </CommonPage>
</template>

<script setup>
import { NButton, NTag } from 'naive-ui'
import { region } from '@/api'
import { BasicCrud, BasicModal, BasicQueryItem } from '@/components/Table'
import { useCrud } from '@/composables'
import { formatDateTime } from '@/utils'

defineOptions({ name: 'RegionMgt' })

const $table = ref(null)
const queryItems = ref({})
const regionTreeData = ref([])

onMounted(() => {
  $table.value?.handleSearch()
  loadRegionTree()
})

async function loadRegionTree() {
  const { data } = await region.read()
  regionTreeData.value = data || []
}

const {
  modalForm,
  modalAction,
  handleAdd,
  handleDelete,
  handleOpen,
  handleSave
} = useCrud({
  name: '区域',
  initForm: { pid: '0', sort: 0 },
  doCreate: region.create,
  doDelete: region.delete,
  doUpdate: region.update,
  refresh: () => $table.value?.handleSearch()
})

const columns = [
  { title: '区域名称', key: 'name', width: 200, ellipsis: { tooltip: true } },
  { title: '区域代码', key: 'code', width: 150 },
  { title: '排序', key: 'sort', width: 80 },
  {
    title: '创建时间',
    key: 'createDate',
    width: 180,
    render(row) {
      return h('span', formatDateTime(row.createDate))
    }
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
            onClick: () => handleOpen({ action: 'edit', title: '编辑区域', row, onOk: handleSave })
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
