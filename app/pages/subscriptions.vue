<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

definePageMeta({ middleware: 'auth' })

useHead({ title: 'Subscriptions · Unmyst' })

const { data: subs, refresh } = await useFetch<Subscription[]>('/api/subscriptions', {
  default: () => []
})
</script>

<template>
  <UDashboardPanel id="subscriptions">
    <template #header>
      <UDashboardNavbar title="Subscriptions">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <SubscriptionsAddDialog @saved="refresh" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <SubscriptionsTable :subscriptions="subs" @refresh="refresh" />

      <LogoAttribution class="mt-4" />
    </template>
  </UDashboardPanel>
</template>
