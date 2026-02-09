<template>
  <n-menu
    ref="menu"
    class="side-menu"
    accordion
    :indent="18"
    :collapsed-icon-size="22"
    :collapsed-width="64"
    :collapsed="appStore.collapsed"
    :options="permissionStore.menus"
    :value="activeKey"
    :expanded-keys="expandedKeys"
    @update:value="handleMenuSelect"
    @update:expanded-keys="handleExpandedKeysChange"
  />
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore, usePermissionStore } from '@/store'
import { isExternal } from '@/utils'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const menu = ref(null)

// 当前激活菜单 key
const activeKey = computed(() => {
  const key = route.meta?.parentKey || route.name
  // 尝试转换为数字，如果失败则保持原样
  const numKey = Number(key)
  return Number.isNaN(numKey) ? String(key) : numKey
})

// 存储展开的父级 keys
const expandedKeys = ref([])

// 递归查找父级 key
function findParentKeys(menus, targetKey, parents = []) {
  for (const menu of menus) {
    if (String(menu.key) === String(targetKey))
      return parents
    if (menu.children?.length) {
      const result = findParentKeys(menu.children, targetKey, [...parents, menu.key])
      if (result)
        return result
    }
  }
  return null
}

// 更新展开 keys（直接设置，确保当前路由对应的菜单展开）
function updateExpandedKeys() {
  if (!permissionStore.menus?.length)
    return
  console.log('[SideMenu] updateExpandedKeys - activeKey:', activeKey.value, 'type:', typeof activeKey.value)
  console.log('[SideMenu] updateExpandedKeys - menus:', permissionStore.menus)
  const parents = findParentKeys(permissionStore.menus, activeKey.value)
  console.log('[SideMenu] updateExpandedKeys - parents:', parents)
  if (!parents)
    return
  // 直接设置，确保刷新后能正确展开
  expandedKeys.value = parents
  console.log('[SideMenu] updateExpandedKeys - expandedKeys:', expandedKeys.value)
}

// 用户手动展开/收起
function handleExpandedKeysChange(keys) {
  expandedKeys.value = keys
}

// 点击菜单
function handleMenuSelect(key, item) {
  if (!item)
    return
  if (isExternal(item.path)) {
    $dialog.confirm({
      type: 'info',
      title: '请选择打开方式',
      positiveText: '外链打开',
      negativeText: '在本站内嵌打开',
      confirm() { window.open(item.path) },
      cancel: () => router.push(`/iframe/${item.code}`)
    })
  }
  else {
    if (item.path)
      router.push(item.path)
  }
}

/**
 * 核心逻辑：
 * 1. 监听路由变化，确保刷新后能正确展开到对应菜单
 * 2. 同时监听菜单数据加载完成
 */
watch(
  () => route.path,
  (newPath) => {
    console.log('[SideMenu] route.path changed:', newPath, 'activeKey:', activeKey.value)
    if (permissionStore.menus?.length) {
      nextTick(() => {
        updateExpandedKeys()
        menu.value?.showOption?.()
      })
    }
  },
  { immediate: true }
)

watch(
  () => permissionStore.menus?.length,
  (hasMenus) => {
    console.log('[SideMenu] menus loaded:', hasMenus)
    if (hasMenus) {
      nextTick(() => {
        updateExpandedKeys()
        menu.value?.showOption?.()
      })
    }
  },
  { immediate: true }
)
</script>

<style>
.side-menu:not(.n-menu--collapsed) {
  :deep(.n-menu-item-content.n-menu-item-content--selected) {
    background-color: rgba(0, 200, 0, 0.1) !important;
    color: green !important;
  }
  :deep(.n-menu-item-content.n-menu-item-content--selected::before) {
    border-left: 4px solid green !important;
  }
}
</style>
