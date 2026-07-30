<script setup lang="ts">
const { user } = useUserSession()

const displayUser = computed(() => ({
  name: user.value?.name || user.value?.email?.split('@')[0] || 'User',
  email: user.value?.email || '',
  avatar: user.value?.image || ''
}))

const mobileOpen = ref(false)
</script>

<template>
  <div class="flex min-h-svh bg-background">
    <!-- Desktop sidebar -->
    <aside class="hidden w-72 shrink-0 border-r border-sidebar-border md:block">
      <div class="sticky top-0 h-svh">
        <SidebarAppSidebar :user="displayUser" />
      </div>
    </aside>

    <!-- Main column -->
    <div class="flex min-w-0 flex-1 flex-col">
      <AppHeader @toggle="mobileOpen = true" />
      <main class="flex flex-1 flex-col">
        <div class="flex flex-1 flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
          <slot />
        </div>
      </main>
    </div>

    <!-- Mobile sidebar -->
    <USlideover v-model:open="mobileOpen" side="left" :ui="{ content: 'w-72' }">
      <template #content>
        <SidebarAppSidebar :user="displayUser" @navigate="mobileOpen = false" />
      </template>
    </USlideover>
  </div>
</template>
