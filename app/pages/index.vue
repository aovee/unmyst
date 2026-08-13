<script setup lang="ts">
import { format } from 'date-fns'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

useHead({ title: 'Dashboard' })

const { subscriptions: subs } = await useSubscriptions()

const { count: renewingSoon } = useUpcomingRenewals(subs, { windowDays: 30 })

const navbarOptions = computed<{ title: string, description: string }>(() => {
  return {
    title: format(new Date(), 'MMMM yyyy'),
    description: `${subs.value.length} active subscriptions · ${renewingSoon.value} renewing in the next 30 days`
  }
})
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <AppNavbar v-bind="navbarOptions">
        <template #right>
          <UButton
            to="/subscriptions"
            label="All subscriptions"
            size="md"
            variant="outline"
            trailing-icon="i-lucide-chevron-right"
          />
        </template>
      </AppNavbar>
    </template>

    <template #body>
      <div class="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <DashboardActuallyBilled :subscriptions="subs" class="col-span-1 xl:col-span-2" />

        <DashboardSpendForecast :subscriptions="subs" />
        <DashboardTopSubscriptions :subscriptions="subs" />

        <DashboardAveragedOutSubscriptions :subscriptions="subs" class="col-span-1 xl:col-span-2" />

        <DashboardUpcomingRenewals :subscriptions="subs" />
        <DashboardRenewalCalendar :subscriptions="subs" />
      </div>
    </template>
  </UDashboardPanel>
</template>
