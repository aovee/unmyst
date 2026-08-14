<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { t } = useI18n()
const locale = useLocale()

useHead({ title: () => t('nav.dashboard') })

const { subscriptions: subs } = await useSubscriptions()

const { count: renewingSoon } = useUpcomingRenewals(subs, { windowDays: 30 })

const navbarOptions = computed<{ title: string, description: string }>(() => {
  return {
    title: capitalize(new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric' })
      .format(new Date())),
    description: t('dashboard.navbarDescription', {
      count: subs.value.length,
      renewing: renewingSoon.value
    })
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
            :label="$t('dashboard.allSubscriptions')"
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

        <DashboardCategoryBreakdown :subscriptions="subs" />
        <DashboardSubscriptionCreep :subscriptions="subs" />

        <DashboardAveragedOutSubscriptions :subscriptions="subs" class="col-span-1 xl:col-span-2" />

        <DashboardUpcomingRenewals :subscriptions="subs" />
        <DashboardRenewalCalendar :subscriptions="subs" />
      </div>
    </template>
  </UDashboardPanel>
</template>
