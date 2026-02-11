<template>
  <CommonPage>
    <template #action>
      <NButton type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        新增角色
      </NButton>
    </template>

    <BasicTable
      ref="$table"
      v-model:query-items="queryItems"
      :columns="columns"
      :get-data="role.read"
      :scroll-x="1200"
    >
      <BasicQuery :label-width="50" label="角色名">
        <n-input v-model:value="queryItems.name" clearable placeholder="请输入角色名" type="text" />
      </BasicQuery>
      <BasicQuery :label-width="50" label="状态">
        <n-select
          v-model:value="queryItems.enable"
          :options="[
            { label: '启用', value: 1 },
            { label: '停用', value: 0 },
          ]"
          clearable
        />
      </BasicQuery>
    </BasicTable>
    <BasicModal ref="modalRef" width="520px">
      <n-form
        ref="modalFormRef"
        :label-width="80"
        :model="modalForm"
        label-align="left"
        label-placement="left"
      >
        <n-form-item
          :rule="{
            required: true,
            message: '请输入角色名',
            trigger: ['input', 'blur'],
          }"
          label="角色名"
          path="name"
        >
          <n-input v-model:value="modalForm.name" />
        </n-form-item>
        <n-form-item
          :rule="{
            required: true,
            message: '请输入角色编码',
            trigger: ['input', 'blur'],
          }"
          label="角色编码"
          path="code"
        >
          <n-input v-model:value="modalForm.code" :disabled="modalAction !== 'add'" />
        </n-form-item>
        <n-form-item label="权限" path="permissionIds">
          <n-tree
            :checked-keys="modalForm.permissionIds"
            :data="permissionTree"
            :on-update:checked-keys="(keys) => (modalForm.permissionIds = keys)"
            :selectable="false"
            check-on-click
            checkable

            class="cus-scroll max-h-200 w-full" default-expand-all key-field="id"
            label-field="name"
          />
        </n-form-item>
        <n-form-item label="状态" path="enable">
          <NSwitch v-model:value="modalForm.enable">
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
import { NButton, NSwitch } from 'naive-ui'
import { role } from '@/api'
import { BasicModal } from '@/components/BasicModal'
import { BasicQuery } from '@/components/BasicQuery'
import { BasicTable } from '@/components/BasicTable'
import { CommonPage } from '@/components/CommonPage'
import { useCrud } from '@/composables'

defineOptions({ name: 'RoleMgt' })

const router = useRouter()

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({})

onMounted(() => {
  $table.value?.handleSearch()
})

const { modalRef, modalFormRef, modalAction, modalForm, handleAdd, handleDelete, handleEdit }
  = useCrud({
    name: '角色',
    doCreate: role.create,
    doDelete: role.delete,
    doUpdate: role.update,
    initForm: { enable: true },
    refresh: (_, keepCurrentPage) => $table.value?.handleSearch(keepCurrentPage)
  })

const columns = [
  { title: '角色名', key: 'name' },
  { title: '角色编码', key: 'code' },
  {
    title: '状态',
    key: 'enable',
    render: (row) =>
      h(
        NSwitch,
        {
          size: 'small',
          rubberBand: false,
          value: row.enable,
          loading: !!row.enableLoading,
          disabled: row.code === 'SUPER_ADMIN',
          onUpdateValue: () => handleEnable(row)
        },
        {
          checked: () => '启用',
          unchecked: () => '停用'
        }
      )
  },
  {
    title: '操作',
    key: 'actions',
    width: 320,
    align: 'right',
    fixed: 'right',
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            secondary: true,
            onClick: () =>
              router.push({ path: `/system/role/user/${row.id}`, query: { roleName: row.name } })
          },
          {
            default: () => '分配用户',
            icon: () => h('i', { class: 'i-fe:user-plus text-14' })
          }
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            style: 'margin-left: 12px;',
            disabled: row.code === 'SUPER_ADMIN',
            onClick: () => handleEdit(row)
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
            disabled: row.code === 'SUPER_ADMIN',
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

async function handleEnable(row) {
  row.enableLoading = true
  try {
    await role.update({ id: row.id, enable: !row.enable })
    row.enableLoading = false
    $message.success('操作成功')
    $table.value?.handleSearch()
  }
  catch (error) {
    console.error(error)
    row.enableLoading = false
  }
}

const permissionTree = ref([])
role.getAllPermissionTree().then(({ data = [] }) => (permissionTree.value = data))
</script>
