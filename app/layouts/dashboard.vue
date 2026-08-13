<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const toast = useToast()

const open = ref(false)

const links = [[{
  label: 'Dashboard',
  icon: 'i-lucide-house',
  to: '/',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Subscriptions',
  icon: 'i-lucide-credit-card',
  to: '/subscriptions',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'About',
  icon: 'i-lucide-info',
  to: '/about',
  onSelect: () => {
    open.value = false
  }
}]] satisfies NavigationMenuItem[][]

onMounted(async () => {
  const cookie = useCookie('cookie-consent', {
    maxAge: 60 * 60 * 24 * 365
  })
  if (cookie.value === 'accepted') {
    return
  }

  toast.add({
    title: 'We use first-party cookies to enhance your experience on our website.',
    duration: 0,
    close: false,
    actions: [{
      label: 'Accept',
      color: 'neutral',
      variant: 'outline',
      onClick: () => {
        cookie.value = 'accepted'
      }
    }, {
      label: 'Opt out',
      color: 'neutral',
      variant: 'ghost'
    }]
  })
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-muted/30"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <div
          class="w-full"
          :class="collapsed ? 'flex-col justify-center gap-1' : 'flex flex-row justify-between'"
        >
          <AppLogo
            :collapsed="collapsed"
            class="bg-transparent ring-default"
            to="/"
          />
          <UDashboardSidebarCollapse />
        </div>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
