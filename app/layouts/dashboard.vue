<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const toast = useToast()
const { t } = useI18n()
const localePath = useLocalePath()

const open = ref(false)

const links = computed<NavigationMenuItem[][]>(() => [[{
  label: t('nav.dashboard'),
  icon: 'i-lucide-house',
  to: localePath('/dashboard'),
  onSelect: () => {
    open.value = false
  }
}, {
  label: t('nav.subscriptions'),
  icon: 'i-lucide-credit-card',
  to: localePath('/dashboard/subscriptions'),
  onSelect: () => {
    open.value = false
  }
}], [
  {
    label: t('nav.about'),
    icon: 'i-lucide-info',
    to: localePath('/'),
    target: '_blank',
    onSelect: () => {
      open.value = false
    }
  }
]])

onMounted(async () => {
  const cookie = useCookie('cookie-consent', {
    maxAge: 60 * 60 * 24 * 365
  })
  if (cookie.value === 'accepted') {
    return
  }

  toast.add({
    title: t('cookie.message'),
    duration: 0,
    close: false,
    actions: [{
      label: t('cookie.accept'),
      color: 'neutral',
      variant: 'outline',
      onClick: () => {
        cookie.value = 'accepted'
      }
    }, {
      label: t('cookie.optOut'),
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
            :to="localePath('/dashboard')"
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

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
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
