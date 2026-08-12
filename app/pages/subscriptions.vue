<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

definePageMeta({ middleware: 'auth' })

useHead({ title: 'Subscriptions' })

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
          <SubscriptionAddDialog @saved="refresh" />
        </template>
      </UDashboardNavbar>

      <!-- <DataToolbar>
        <DataToolbarCard
          title="per month"
          value="€123.5"
          description="all plans levelled to a month"
        />
      </DataToolbar> -->
    </template>

    <template #body>
      <SubscriptionTable :subscriptions="subs" @refresh="refresh" />

      <LogoAttribution class="mt-4" />
    </template>
  </UDashboardPanel>
</template>
