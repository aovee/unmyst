<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { subscriptions: subs, refresh } = await useSubscriptions()

const locale = useLocale()
const { t } = useI18n()

useHead({ title: () => t('subscriptions.title') })

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
  if (inDays === 0) return t('relative.today').toLowerCase()
  if (inDays === 1) return t('relative.tomorrow').toLowerCase()
  return t('relative.inDays', inDays)
}

function formatChargeDate(date: Date): string {
  return new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short' })
    .format(date)
}

const searchTerm = ref<string>('')
const query = ref<string>('')
const loading = ref<boolean>(false)

const applyQuery = useDebounceFn((value: string) => {
  query.value = value.trim().toLowerCase()
  loading.value = false
}, 300)

function onSearch(value: string) {
  loading.value = true
  applyQuery(value)
}

const periodFilter = ref<PeriodFilter['value']>('all')
const periodFilters = computed<PeriodFilter[]>(() => [
  { label: t('filters.all'), value: 'all' },
  { label: t('cycle.weekly'), value: 'weekly' },
  { label: t('cycle.monthly'), value: 'monthly' },
  { label: t('cycle.yearly'), value: 'yearly' }
])

// Client-side filtering. The period tab (FilterTabs) always applies; the text
// query narrows further only when something has been typed.
const filteredSubs = computed(() => {
  return subs.value.filter((s) => {
    if (periodFilter.value !== 'all' && s.cycle !== periodFilter.value) {
      return false
    }

    if (query.value) {
      return [s.service, s.description, s.category]
        .filter(Boolean)
        .some(field => field!.toLowerCase().includes(query.value))
    }

    return true
  })
})
</script>

<template>
  <UDashboardPanel id="subscriptions">
    <template #header>
      <AppNavbar
        :title="$t('subscriptions.title')"
        :description="$t('subscriptions.headerDescription', { count: subs.length })"
      >
        <template #right>
          <SubscriptionAddDialog @saved="refresh" />
        </template>
      </AppNavbar>

      <DataToolbar class="hidden md:grid">
        <DataToolbarCard
          :title="$t('subscriptions.cards.perMonth')"
          :value="formatCurrency(perMonth, currency, locale)"
          :description="$t('subscriptions.cards.perMonthDescription')"
        />

        <DataToolbarCard
          :title="$t('subscriptions.cards.perYear')"
          :value="formatCurrency(perYear, currency, locale)"
          :description="$t('subscriptions.cards.perYearDescription', {
            services: $t('subscriptions.cards.services', subs.length),
            categories: $t('subscriptions.cards.categories', categoryCount)
          })"
        />

        <DataToolbarCard
          :title="$t('subscriptions.cards.nextCharge')"
          :value="nextCharge ? formatCurrency(nextCharge.amount, nextCharge.sub.currency, locale) : '—'"
          :description="
            nextCharge
              ? $t('subscriptions.cards.nextChargeDescription', {
                service: nextCharge.sub.service,
                when: chargeLabel(nextCharge.inDays),
                date: formatChargeDate(nextCharge.date)
              })
              : $t('subscriptions.cards.nextChargeEmpty')
          "
        />

        <DataToolbarCard :title="$t('subscriptions.cards.next30Days')">
          <template #content>
            <div class="title-upper">
              {{ $t('subscriptions.cards.next30Days') }}
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
              {{ $t('subscriptions.cards.noRenewals') }}
            </div>

            <div class="text-xs text-muted">
              <template v-if="next30.length">
                {{ $t('subscriptions.cards.next30Due', {
                  amount: formatCurrency(next30Total, currency, locale),
                  count: $t('subscriptions.cards.renewals', next30.length)
                }) }}
              </template>
              <template v-else>
                {{ $t('subscriptions.cards.nothingDue') }}
              </template>
            </div>
          </template>
        </DataToolbarCard>
      </DataToolbar>

      <DataToolbar>
        <DataToolbarCard full-width>
          <template #content>
            <div class="flex flex-col items-start sm:flex-row sm:items-center justify-between gap-4 w-full">
              <UInput
                v-model="searchTerm"
                :loading="loading"
                type="search"
                :placeholder="$t('subscriptions.search')"
                icon="i-lucide-search"
                class="min-w-xs w-full sm:w-auto"
                size="xs"
                :ui="{
                  base: 'py-3',
                  leadingIcon: 'size-3'
                }"
                @update:model-value="onSearch"
              />
              <FilterTabs
                v-model="periodFilter"
                :label="$t('subscriptions.filterBy')"
                :items="periodFilters"
              />
            </div>
          </template>
        </DataToolbarCard>
      </DataToolbar>
    </template>

    <template #body>
      <SubscriptionTable :subscriptions="filteredSubs" @refresh="refresh" />

      <LogoAttribution class="mt-4" />
    </template>
  </UDashboardPanel>
</template>
