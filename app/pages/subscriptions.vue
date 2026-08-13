<script setup lang="ts">
import { format } from 'date-fns'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

useHead({ title: 'Subscriptions' })

const { subscriptions: subs, refresh } = await useSubscriptions()

const locale = useLocale()

// Summary figures assume a single currency; fall back to the first sub's.
const currency = computed(() => subs.value[0]?.currency ?? 'EUR')

// Per-person run-rate, every plan levelled to a common cycle.
const perMonth = computed(() =>
  subs.value.reduce(
    (sum, s) => sum + monthlyAmount(personalAmount(s), s.cycle, s.intervalCount),
    0
  )
)
const perYear = computed(() =>
  subs.value.reduce(
    (sum, s) => sum + annualAmount(personalAmount(s), s.cycle, s.intervalCount),
    0
  )
)

const categoryCount = computed(
  () => new Set(subs.value.map(s => s.category).filter(Boolean)).size
)

// Next charge (any horizon) + the next-30-days window, from the shared helper.
const { nextCharge, renewals: next30, total: next30Total } = useUpcomingRenewals(subs, {
  windowDays: 30
})

const next30Max = computed(() => Math.max(1, ...next30.value.map(r => r.amount)))

function chargeLabel(inDays: number): string {
  if (inDays === 0) return 'today'
  if (inDays === 1) return 'tomorrow'
  return `in ${inDays} days`
}

const search = ref<string>('')
</script>

<template>
  <UDashboardPanel id="subscriptions">
    <template #header>
      <AppNavbar
        title="Subscriptions"
        description="15 active · levelled to a monthly figure so yearly plans stop hiding"
      >
        <template #right>
          <SubscriptionAddDialog @saved="refresh" />
        </template>
      </AppNavbar>

      <DataToolbar>
        <DataToolbarCard
          title="per month"
          :value="formatCurrency(perMonth, currency, locale)"
          description="all plans levelled to a month"
        />

        <DataToolbarCard
          title="per year"
          :value="formatCurrency(perYear, currency, locale)"
          :description="`${subs.length} ${subs.length === 1 ? 'service' : 'services'} across ${categoryCount} ${categoryCount === 1 ? 'category' : 'categories'}`"
        />

        <DataToolbarCard
          title="next charge"
          :value="nextCharge ? formatCurrency(nextCharge.amount, nextCharge.sub.currency, locale) : '—'"
          :description="
            nextCharge
              ? `${nextCharge.sub.service} · ${chargeLabel(nextCharge.inDays)}, ${format(nextCharge.date, 'd MMM')}`
              : 'nothing scheduled'
          "
        />

        <DataToolbarCard title="next 30 days">
          <template #content>
            <div class="uppercase text-xs text-muted tracking-widest font-semibold">
              next 30 days
            </div>

            <div v-if="next30.length" class="flex items-end gap-1 h-9">
              <div
                v-for="u in next30"
                :key="u.sub.id"
                class="flex-1 min-w-0 rounded-sm bg-primary"
                :style="{ height: `${Math.max(12, (u.amount / next30Max) * 100)}%` }"
                :title="`${u.sub.service} · ${formatCurrency(u.amount, u.sub.currency, locale)}`"
              />
            </div>
            <div v-else class="h-9 flex items-center text-sm text-muted">
              no renewals
            </div>

            <div class="text-xs text-muted">
              <template v-if="next30.length">
                {{ formatCurrency(next30Total, currency, locale) }} due across
                {{ next30.length }} {{ next30.length === 1 ? 'renewal' : 'renewals' }}
              </template>
              <template v-else>
                nothing due this month
              </template>
            </div>
          </template>
        </DataToolbarCard>
      </DataToolbar>

      <DataToolbar>
        <DataToolbarCard full-width>
          <template #content>
            <div class="flex items-center justify-between">
              <div>
                <UInput
                  v-model="search"
                  type="search"
                  placeholder="Search subscriptions"
                  icon="i-lucide-search"
                  :ui="{
                    leadingIcon: 'size-3'
                  }"
                />
              </div>
              <div>
                <!-- <UTabs :items="items" size="sm" /> -->
                <FilterTabs />
              </div>
            </div>
          </template>
        </DataToolbarCard>
      </DataToolbar>
    </template>

    <template #body>
      <SubscriptionTable :subscriptions="subs" @refresh="refresh" />

      <LogoAttribution class="mt-4" />
    </template>
  </UDashboardPanel>
</template>
