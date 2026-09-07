<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { t } = useI18n()
const locale = useLocale()
const localePath = useLocalePath()

useHead({ title: () => t('nav.dashboard') })

const { subscriptions: subs, refresh } = await useSubscriptions()

// Spend and forecast sections reflect what's actually billing: paused and
// canceled plans drop out. They stay visible/manageable on the subscriptions
// list. Renewal sections filter internally (see `useUpcomingRenewals`).
const activeSubs = computed(() => subs.value.filter(s => isBillingActive(s)))

const { count: renewingSoon } = useUpcomingRenewals(subs, { windowDays: 30 })

// Only surface the annual-savings section when there's actually something to
// switch — a permanent empty nudge at the top of the dashboard is just noise.
const { count: savingsCount } = useAnnualPlanSuggestions(subs)

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
            :to="localePath('/dashboard/subscriptions')"
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
        <DashboardActuallyBilled :subscriptions="activeSubs" class="col-span-1 xl:col-span-2" />

        <DashboardSavingsSuggestions
          v-if="savingsCount > 0"
          :subscriptions="subs"
          class="col-span-1 xl:col-span-2"
          @refresh="refresh"
        />

        <DashboardSpendForecast :subscriptions="activeSubs" />
        <DashboardTopSubscriptions :subscriptions="activeSubs" />

        <DashboardCategoryBreakdown :subscriptions="activeSubs" />
        <DashboardSubscriptionCreep :subscriptions="activeSubs" />

        <DashboardAveragedOutSubscriptions :subscriptions="activeSubs" class="col-span-1 xl:col-span-2" />

        <DashboardUpcomingRenewals :subscriptions="subs" />
        <DashboardRenewalCalendar :subscriptions="activeSubs" />
      </div>
    </template>
  </UDashboardPanel>
</template>
