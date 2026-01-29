<template>
  <AppCard border-b="1px solid light_border dark:dark_border" class="flex items-center px-12">
    <MenuCollapse />

    <BreadCrumb v-if="type === 'full'" />

    <AppTab v-if="type === 'normal'" class="w-0 flex-1 px-12" />
    <span v-if="type === 'normal'" class="mx-6 opacity-20">|</span>

    <div class="ml-auto flex flex-shrink-0 items-center px-12 text-18">
      <BeginnerGuide />

      <ToggleTheme />

      <Fullscreen />

      <ThemeSetting class="mr-16" />

      <UserAvatar />
    </div>
  </AppCard>
</template>

<script setup>
import { AppCard } from '@/components/AppCard'
import { ThemeSetting } from '@/components/ThemeSetting'
import { ToggleTheme } from '@/components/ToggleTheme'
import { AppTab, BeginnerGuide, BreadCrumb, Fullscreen, MenuCollapse, UserAvatar } from './components'

defineProps({
  type: {
    type: String,
    default: 'full'
  }
})
</script>
