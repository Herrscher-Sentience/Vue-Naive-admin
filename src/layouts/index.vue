<template>
  <template v-if="type === 'empty'">
    <slot />
  </template>

  <template v-else>
    <div class="wh-full flex">
      <aside
        v-if="showSidebar"
        :class="appStore.collapsed ? 'w-64' : 'w-220'"
        border-r="1px solid light_border dark:dark_border"
        class="flex-col flex-shrink-0 transition-width-300"
      >
        <SideLogo border-b="1px solid light_border dark:dark_border" />
        <SideMenu class="cus-scroll-y mt-4 h-0 flex-1" />
        <div v-if="type === 'simple'" class="my-12 flex items-center justify-around px-12">
          <UserAvatar v-if="!appStore.collapsed" />
          <MenuCollapse />
        </div>
      </aside>

      <article class="w-0 flex-col flex-1">
        <LayoutHeader v-if="showHeader" :type="type" class="h-60 flex-shrink-0" />
        <div v-if="showTab" border-b="1px solid light_border dark:dark_border" class="p-12">
          <AppTab class="flex-shrink-0" />
        </div>
        <slot />
      </article>
    </div>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/store'
import { AppTab, MenuCollapse, SideLogo, SideMenu, UserAvatar } from './components'
import LayoutHeader from './LayoutHeader.vue'

const props = defineProps({
  type: {
    type: String,
    default: 'full',
    validator: (value) => ['empty', 'full', 'normal', 'simple'].includes(value)
  }
})

const appStore = useAppStore()

// 根据布局类型控制显示哪些部分
const showSidebar = computed(() => ['full', 'normal', 'simple'].includes(props.type))
const showHeader = computed(() => ['full', 'normal'].includes(props.type))
const showTab = computed(() => props.type === 'full')
</script>

<style></style>
