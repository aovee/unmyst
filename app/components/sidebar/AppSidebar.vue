<script setup lang="ts">
defineProps<{
  user: { name: string; email: string; avatar: string }
}>()
const emit = defineEmits<{ navigate: [] }>()

const navMain = [
  { title: 'Dashboard', url: '/', icon: 'i-lucide-house' },
  { title: 'Subscriptions', url: '/subscriptions', icon: 'i-lucide-credit-card' }
]
</script>

<template>
  <div class="flex h-full flex-col bg-sidebar text-sidebar-foreground">
    <div class="p-3">
      <NuxtLink to="/" @click="emit('navigate')">
        <Logo class="me-auto h-10 w-auto" />
      </NuxtLink>
    </div>
    <div class="flex-1 overflow-y-auto">
      <SidebarNavMain :items="navMain" @navigate="emit('navigate')" />
    </div>
    <div class="border-t border-sidebar-border p-2">
      <SidebarNavUser :user="user" />
    </div>
  </div>
</template>
