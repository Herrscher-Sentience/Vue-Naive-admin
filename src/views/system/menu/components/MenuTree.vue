<template>
  <div>
    <n-space :size="12" vertical>
      <h3>菜单</h3>
      <div class="flex">
        <n-input v-model:value="pattern" clearable placeholder="搜索" />
        <NButton class="ml-12" type="primary" @click="handleAdd()">
          <i class="i-material-symbols:add mr-4 text-14" />
          新增
        </NButton>
      </div>

      <n-tree
        :data="treeData"
        :expanded-keys="expandedKeys"
        :on-update:expanded-keys="onUpdateExpandedKeys"
        :on-update:selected-keys="onSelect"
        :pattern="pattern"
        :render-prefix="renderPrefix"
        :render-suffix="renderSuffix"
        :selected-keys="[currentMenu?.id]"
        :show-irrelevant-nodes="false"
        block-line
        key-field="id"
        label-field="name"
      />
    </n-space>

    <ResAddOrEdit ref="modalRef" :menus="treeData" @refresh="(data) => emit('refresh', data)" />
  </div>
</template>

<script setup>
import { NButton } from 'naive-ui'
import { withModifiers } from 'vue'
import { deletePermission } from '@/views/system/menu/api.js'
import ResAddOrEdit from './ResAddOrEdit.vue'

defineProps({
  treeData: {
    type: Array,
    default: () => []
  },
  currentMenu: {
    type: Object,
    default: () => null
  }
})
const emit = defineEmits(['refresh', 'update:currentMenu'])

const pattern = ref('')
const expandedKeys = ref([])

const onUpdateExpandedKeys = (keys) => {
  expandedKeys.value = keys
}

const modalRef = ref(null)

const handleAdd = async (data = {}) => {
  modalRef.value?.handleOpen({
    action: 'add',
    title: '新增菜单',
    row: { type: 'MENU', ...data },
    okText: '保存'
  })
}

const onSelect = (keys, option, { action, node }) => {
  emit('update:currentMenu', action === 'select' ? node : null)
}

const renderPrefix = ({ option }) => {
  return h('i', { class: `${option.icon}?mask text-16` })
}

const renderSuffix = ({ option }) => {
  return [
    h(
      NButton,
      {
        text: true,
        type: 'primary',
        title: '新增下级菜单',
        size: 'tiny',
        onClick: withModifiers(() => handleAdd({ parentId: option.id }), ['stop'])
      },
      { default: () => '新增' }
    ),
    h(
      NButton,
      {
        text: true,
        type: 'error',
        size: 'tiny',
        style: 'margin-left: 12px;',
        onClick: withModifiers(() => handleDelete(option), ['stop'])
      },
      { default: () => '删除' }
    )
  ]
}

const handleDelete = (item) => {
  $dialog.confirm({
    content: `确认删除【${item.name}】？`,
    async confirm() {
      try {
        $message.loading('正在删除', { key: 'deleteMenu' })
        await deletePermission(item.id)
        $message.success('删除成功', { key: 'deleteMenu' })
        emit('refresh')
        emit('update:currentMenu', null)
      }
      catch (error) {
        console.error(error)
        $message.destroy('deleteMenu')
      }
    }
  })
}
</script>
