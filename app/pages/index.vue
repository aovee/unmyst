<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

definePageMeta({ middleware: 'auth' })

useHead({ title: 'Subscriptions · Unmyst' })

const { data: subs } = await useFetch<Subscription[]>('/api/subscriptions', {
  default: () => []
})
</script>

<template>
  <UDashboardPanel id="home">
    <template #body>
      <DashboardSubscriptionsData :subscriptions="subs" />

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardUpcomingRenewals :subscriptions="subs" />
        <DashboardCategoryBreakdown :subscriptions="subs" />
        <DashboardSpendForecast :subscriptions="subs" class="lg:col-span-2" />
        <DashboardTopSubscriptions :subscriptions="subs" class="lg:col-span-2" />
      </div>

      <div class="mt-4 flex justify-end">
        <UButton
          to="/subscriptions"
          icon="i-lucide-list"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-arrow-right"
        >
          Manage subscriptions
        </UButton>
      </div>
    </template>
  </UDashboardPanel>
</template>
