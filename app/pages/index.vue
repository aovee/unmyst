<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

definePageMeta({ middleware: 'auth' })

useHead({ title: 'Dashboard' })

const { data: subs } = await useFetch<Subscription[]>('/api/subscriptions', {
  default: () => []
})
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <DashboardActuallyBilled :subscriptions="subs" class="col-span-2" />

        <DashboardSpendForecast :subscriptions="subs" />
        <DashboardTopSubscriptions :subscriptions="subs" />

        <DashboardAveragedOutSubscriptions :subscriptions="subs" class="col-span-2" />

        <DashboardUpcomingRenewals :subscriptions="subs" />
        <DashboardRenewalCalendar :subscriptions="subs" />
      </div>
    </template>
  </UDashboardPanel>
</template>
