<template>
  <CommonPage>
    <div class="flex">
      <n-spin :show="treeLoading" size="small">
        <MenuTree
          v-model:current-menu="currentMenu"
          :tree-data="treeData"
          class="w-320 shrink-0"
          @refresh="initData"
        />
      </n-spin>

      <div class="ml-40 w-0 flex-1">
        <template v-if="currentMenu">
          <div class="flex justify-between">
            <h3 class="mb-12">
              {{ currentMenu.name }}
            </h3>
            <NButton size="small" type="primary" @click="handleEdit(currentMenu)">
              <i class="i-material-symbols:edit-outline mr-4 text-14" />
              编辑
            </NButton>
          </div>
          <n-descriptions :column="2" bordered label-placement="left">
            <n-descriptions-item label="编码">
              {{ currentMenu.code }}
            </n-descriptions-item>
            <n-descriptions-item label="名称">
              {{ currentMenu.name }}
            </n-descriptions-item>
            <n-descriptions-item label="路由地址">
              {{ currentMenu.path ?? '--' }}
            </n-descriptions-item>
            <n-descriptions-item label="组件路径">
              {{ currentMenu.component ?? '--' }}
            </n-descriptions-item>
            <n-descriptions-item label="菜单图标">
              <span v-if="currentMenu.icon" class="flex items-center">
                <i :class="`${currentMenu.icon}?mask text-22 mr-8`" />
                <span class="opacity-50">{{ currentMenu.icon }}</span>
              </span>
              <span v-else>无</span>
            </n-descriptions-item>
            <n-descriptions-item label="layout">
              {{ currentMenu.layout || '跟随系统' }}
            </n-descriptions-item>
            <n-descriptions-item label="是否显示">
              {{ currentMenu.show ? '是' : '否' }}
            </n-descriptions-item>
            <n-descriptions-item label="是否启用">
              {{ currentMenu.enable ? '是' : '否' }}
            </n-descriptions-item>
            <n-descriptions-item label="KeepAlive">
              {{ currentMenu.keepAlive ? '是' : '否' }}
            </n-descriptions-item>
            <n-descriptions-item label="排序">
              {{ currentMenu.order ?? '--' }}
            </n-descriptions-item>
          </n-descriptions>

          <div class="mt-32 flex justify-between">
            <h3 class="mb-12">
              按钮
            </h3>
            <NButton size="small" type="primary" @click="handleAddBtn">
              <i class="i-fe:plus mr-4 text-14" />
              新增
            </NButton>
          </div>

          <BasicTable
            ref="tableRef"
            :columns="btnsColumns"
            :get-data="permission.getButtons"
            :query-items="{ parentId: currentMenu.id }"
            :scroll-x="-1"
          />
        </template>
        <n-empty v-else class="h-450 f-c-c" description="请选择菜单查看详情" size="large" />
      </div>
    </div>
    <ResAddOrEdit ref="modalRef" :menus="treeData" @refresh="initData" />
  </CommonPage>
</template>

<script setup>
import { NButton, NSwitch } from 'naive-ui'
import { onMounted } from 'vue'
import { permission } from '@/api'
import BasicTable from '@/components/BasicTable/src/BasicTable.vue'
import { CommonPage } from '@/components/CommonPage/index.js'
import { getMenuList } from '@/views/system/menu/api.js'
import MenuTree from '@/views/system/menu/components/MenuTree.vue'
import ResAddOrEdit from '@/views/system/menu/components/ResAddOrEdit.vue'

const treeData = ref([])
const treeLoading = ref(false)
const tableRef = ref(null)
const currentMenu = ref(null)

const initData = async (data) => {
  if (data?.type === 'BUTTON') {
    tableRef.value.handleSearch()
    return
  }
  treeLoading.value = true
  const { data: result } = await getMenuList()
  treeData.value = result || []
  treeLoading.value = false
  console.log(treeData.value)

  if (data) {
    currentMenu.value = data
  }
}

onMounted(() => {
  initData()
})

const modalRef = ref(null)

const handleEdit = (item = {}) => {
  modalRef.value?.handleOpen({
    action: 'edit',
    title: `编辑菜单 - ${item.name}`,
    row: item,
    okText: '保存'
  })
}

const btnsColumns = [
  { title: '名称', key: 'name' },
  { title: '编码', key: 'code' },
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
            key: 'edit',
            size: 'small',
            type: 'primary',
            style: 'margin-left: 12px;',
            onClick: () => handleEditBtn(row)
          },
          {
            default: () => '编辑',
            icon: () => h('i', { class: 'i-material-symbols:edit-outline text-14' })
          }
        ),
        h(
          NButton,
          {
            key: 'delete',
            size: 'small',
            type: 'error',
            style: 'margin-left: 12px;',
            onClick: () => handleDeleteBtn(row.id)
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

watch(
  () => currentMenu.value,
  async (v) => {
    await nextTick()
    if (v)
      tableRef.value.handleSearch()
  }
)

// 添加按钮
const handleAddBtn = () => {
  modalRef.value?.handleOpen({
    action: 'add',
    title: '新增按钮',
    row: { type: 'BUTTON', parentId: currentMenu.value.id },
    okText: '保存'
  })
}

const handleEditBtn = (row) => {
  modalRef.value?.handleOpen({
    action: 'edit',
    title: `编辑按钮 - ${row.name}`,
    row,
    okText: '保存'
  })
}

const handleDeleteBtn = (id) => {
  const d = $dialog.warning({
    content: '确定删除？',
    title: '提示',
    positiveText: '确定',
    negativeText: '取消',
    async onPositiveClick() {
      try {
        d.loading = true
        await permission.deletePermission(id)
        $message.success('删除成功')
        tableRef.value.handleSearch()
        d.loading = false
      }
      catch (error) {
        console.error(error)
        d.loading = false
      }
    }
  })
}

const handleEnable = async (item) => {
  try {
    item.enableLoading = true
    await permission.savePermission(item.id, {
      enable: !item.enable
    })
    $message.success('操作成功')
    tableRef.value?.handleSearch()
    item.enableLoading = false
  }
  catch (error) {
    console.error(error)
    item.enableLoading = false
  }
}
</script>
