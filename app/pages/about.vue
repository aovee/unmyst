<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()

definePageMeta({ layout: 'front' })

useHead({ title: () => t('about.title') })

// The three readings of the same amounts, each with the rule it applies and a
// worked example so the arithmetic is visible rather than asserted.
const counts = computed(() => [
  { n: '01', title: t('about.howItCounts.one.title'), body: t('about.howItCounts.one.body'), formula: t('about.howItCounts.one.formula'), example: t('about.howItCounts.one.example') },
  { n: '02', title: t('about.howItCounts.two.title'), body: t('about.howItCounts.two.body'), formula: t('about.howItCounts.two.formula'), example: t('about.howItCounts.two.example') },
  { n: '03', title: t('about.howItCounts.three.title'), body: t('about.howItCounts.three.body'), formula: t('about.howItCounts.three.formula'), example: t('about.howItCounts.three.example') }
])

// The fields you can record against a single plan — maps to the add/edit form.
const tracks = computed(() => [
  { icon: 'i-lucide-repeat', title: t('about.track.cycles.title'), body: t('about.track.cycles.body') },
  { icon: 'i-lucide-users', title: t('about.track.splits.title'), body: t('about.track.splits.body') },
  { icon: 'i-lucide-gift', title: t('about.track.trials.title'), body: t('about.track.trials.body') },
  { icon: 'i-lucide-tags', title: t('about.track.categories.title'), body: t('about.track.categories.body') }
])

// The panels the dashboard is built from — one honest line each. Icons match
// the real dashboard components.
const panels = computed(() => [
  { icon: 'i-lucide-receipt', title: t('about.panels.billed.title'), body: t('about.panels.billed.body') },
  { icon: 'i-lucide-trending-up', title: t('about.panels.trends.title'), body: t('about.panels.trends.body') },
  { icon: 'i-lucide-list-ordered', title: t('about.panels.top.title'), body: t('about.panels.top.body') },
  { icon: 'i-lucide-chart-pie', title: t('about.panels.category.title'), body: t('about.panels.category.body') },
  { icon: 'i-lucide-line-chart', title: t('about.panels.creep.title'), body: t('about.panels.creep.body') },
  { icon: 'i-lucide-scale', title: t('about.panels.averaged.title'), body: t('about.panels.averaged.body') },
  { icon: 'i-lucide-calendar-clock', title: t('about.panels.renewals.title'), body: t('about.panels.renewals.body') },
  { icon: 'i-lucide-calendar-days', title: t('about.panels.calendar.title'), body: t('about.panels.calendar.body') }
])

// Concrete facts about the account/data model — replaces the old fabricated
// "storage / last backup" figures with things that are actually true.
const dataRows = computed(() => [
  { label: t('about.data.rows.signIn'), value: t('about.data.rows.signInValue') },
  { label: t('about.data.rows.password'), value: t('about.data.rows.passwordValue') },
  { label: t('about.data.rows.bank'), value: t('about.data.rows.bankValue') },
  { label: t('about.data.rows.stored'), value: t('about.data.rows.storedValue') },
  { label: t('about.data.rows.devices'), value: t('about.data.rows.devicesValue') }
])

const limits = computed(() => [
  t('about.limits.bank'),
  t('about.limits.cancel'),
  t('about.limits.guess'),
  t('about.limits.oneOff')
])

// Illustrative rows for the ledger preview panel (a static product mock).
// Amounts in cents so they format in the active locale like the rest of the app.
const previewRows = [
  { service: 'Netflix', charge: 1799, cycle: 'monthly', levelled: 1799 },
  { service: 'Youtube Premium', charge: 13188, cycle: 'yearly', levelled: 1099 },
  { service: 'Spotify Family', charge: 25488, cycle: 'monthly', levelled: 2124 }
]

const eyebrow = 'text-xs font-semibold uppercase tracking-[0.16em] text-primary'
</script>

<template>
  <div>
    <!-- Hero -->
    <UContainer class="pt-16 pb-14 md:pt-24 md:pb-20">
      <h1 class="font-title text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
        <span class="text-highlighted">{{ $t('about.hero.line1') }}</span><br>
        <span class="text-primary">{{ $t('about.hero.line2') }}</span>
      </h1>
      <p class="mt-6 max-w-2xl leading-relaxed text-muted">
        {{ $t('about.hero.body') }}
      </p>
      <div class="mt-8 flex flex-wrap items-center gap-2">
        <UButton
          to="/subscriptions"
          :label="$t('about.hero.primary')"
          color="primary"
          variant="outline"
        />
        <UButton
          to="#how-it-counts"
          :label="$t('about.hero.secondary')"
          color="neutral"
          variant="link"
        />
      </div>
    </UContainer>

    <USeparator />

    <!-- How it counts -->
    <UContainer id="how-it-counts" class="scroll-mt-20 py-16 md:py-20">
      <p :class="eyebrow">
        {{ $t('about.howItCounts.eyebrow') }}
      </p>
      <h2 class="mt-4 max-w-2xl font-title text-2xl font-semibold leading-tight text-highlighted">
        {{ $t('about.howItCounts.title') }}
      </h2>
      <p class="mt-4 max-w-2xl leading-relaxed text-muted">
        {{ $t('about.howItCounts.intro') }}
      </p>

      <div class="mt-10 flex flex-col">
        <template v-for="(item, i) in counts" :key="item.n">
          <USeparator v-if="i > 0" />
          <div class="grid grid-cols-1 gap-x-10 gap-y-3 py-8 md:grid-cols-[2.5rem_1fr_1.3fr]">
            <div class="font-numbers text-sm text-dimmed">
              {{ item.n }}
            </div>
            <h3 class="font-title text-xl font-semibold leading-snug text-highlighted">
              {{ item.title }}
            </h3>
            <div>
              <p class="leading-relaxed text-muted">
                {{ item.body }}
              </p>
              <div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span class="rounded bg-muted px-2 py-1 font-numbers text-[12px] text-dimmed">
                  {{ item.formula }}
                </span>
                <span class="font-numbers text-[13px] text-primary">
                  {{ item.example }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </UContainer>

    <USeparator />

    <!-- The ledger -->
    <UContainer class="py-16 md:py-20">
      <div class="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
        <div>
          <p :class="eyebrow">
            {{ $t('about.ledger.eyebrow') }}
          </p>
          <h2 class="mt-4 font-title text-2xl font-semibold leading-tight text-highlighted">
            {{ $t('about.ledger.title') }}
          </h2>
          <p class="mt-4 leading-relaxed text-muted">
            {{ $t('about.ledger.body') }}
          </p>
        </div>

        <!-- Static product preview of the ledger -->
        <UCard variant="subtle" :ui="{ body: 'sm:p-5' }">
          <div class="mb-3 flex items-center gap-2 text-dimmed">
            <UIcon name="i-lucide-table-2" class="size-3.5" />
            <span class="text-[11px] uppercase tracking-[0.13em]">{{ $t('about.ledger.previewLabel') }}</span>
          </div>
          <div class="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-default pb-2 text-[10px] uppercase tracking-widest text-dimmed">
            <span>{{ $t('about.ledger.cols.service') }}</span>
            <span class="text-right">{{ $t('about.ledger.cols.charge') }}</span>
            <span class="text-right">{{ $t('about.ledger.cols.levelled') }}</span>
          </div>
          <div
            v-for="row in previewRows"
            :key="row.service"
            class="grid grid-cols-[1fr_auto_auto] items-baseline gap-x-4 border-b border-default/60 py-2.5 last:border-0"
          >
            <div class="min-w-0">
              <div class="truncate text-sm text-highlighted">
                {{ row.service }}
              </div>
              <div class="text-[11px] text-dimmed">
                {{ $t(`cycle.${row.cycle}`) }}
              </div>
            </div>
            <div class="text-right font-numbers text-sm text-muted">
              {{ formatCurrency(row.charge, 'EUR', locale) }}
            </div>
            <div class="text-right font-numbers text-sm text-primary">
              {{ formatCurrency(row.levelled, 'EUR', locale) }}
            </div>
          </div>
        </UCard>
      </div>
    </UContainer>

    <USeparator />

    <!-- What you can record -->
    <UContainer class="py-16 md:py-20">
      <p :class="eyebrow">
        {{ $t('about.track.eyebrow') }}
      </p>
      <h2 class="mt-4 max-w-2xl font-title text-2xl font-semibold leading-tight text-highlighted">
        {{ $t('about.track.title') }}
      </h2>
      <p class="mt-4 max-w-2xl leading-relaxed text-muted">
        {{ $t('about.track.intro') }}
      </p>

      <div class="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
        <div v-for="item in tracks" :key="item.title" class="flex gap-4">
          <div class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UIcon :name="item.icon" class="size-4.5" />
          </div>
          <div>
            <h3 class="font-title text-base font-semibold text-highlighted">
              {{ item.title }}
            </h3>
            <p class="mt-1.5 leading-relaxed text-muted">
              {{ item.body }}
            </p>
          </div>
        </div>
      </div>
    </UContainer>

    <USeparator />

    <!-- On the dashboard -->
    <UContainer class="py-16 md:py-20">
      <p :class="eyebrow">
        {{ $t('about.panels.eyebrow') }}
      </p>
      <h2 class="mt-4 max-w-2xl font-title text-2xl font-semibold leading-tight text-highlighted">
        {{ $t('about.panels.title') }}
      </h2>
      <p class="mt-4 max-w-2xl leading-relaxed text-muted">
        {{ $t('about.panels.intro') }}
      </p>

      <div class="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-default bg-default sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="panel in panels"
          :key="panel.title"
          class="bg-elevated/40 p-5"
        >
          <UIcon :name="panel.icon" class="size-5 text-primary" />
          <h3 class="mt-3 font-title text-sm font-semibold text-highlighted">
            {{ panel.title }}
          </h3>
          <p class="mt-1.5 text-sm leading-relaxed text-muted">
            {{ panel.body }}
          </p>
        </div>
      </div>
    </UContainer>

    <USeparator />

    <!-- Your data -->
    <UContainer id="your-data" class="scroll-mt-20 py-16 md:py-20">
      <div class="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <p :class="eyebrow">
            {{ $t('about.data.eyebrow') }}
          </p>
          <h2 class="mt-4 font-title text-2xl font-semibold leading-tight text-highlighted">
            {{ $t('about.data.title') }}
          </h2>
          <p class="mt-4 leading-relaxed text-muted">
            {{ $t('about.data.body') }}
          </p>
        </div>

        <dl class="self-center">
          <div
            v-for="row in dataRows"
            :key="row.label"
            class="flex items-center justify-between gap-4 border-b border-default py-3 last:border-0"
          >
            <dt class="text-sm text-muted">
              {{ row.label }}
            </dt>
            <dd class="text-right text-sm text-highlighted">
              {{ row.value }}
            </dd>
          </div>
        </dl>
      </div>
    </UContainer>

    <USeparator />

    <!-- Limits -->
    <UContainer id="limits" class="scroll-mt-20 py-16 md:py-20">
      <p :class="eyebrow">
        {{ $t('about.limits.eyebrow') }}
      </p>
      <div class="mt-8 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
        <div v-for="(item, i) in limits" :key="i" class="flex gap-3">
          <UIcon name="i-lucide-x" class="mt-0.5 size-4 shrink-0 text-dimmed" />
          <p class="leading-relaxed text-muted">
            {{ item }}
          </p>
        </div>
      </div>
    </UContainer>

    <USeparator />

    <!-- CTA -->
    <UContainer class="py-16 md:py-20">
      <h2 class="font-title text-2xl font-semibold text-highlighted md:text-3xl">
        {{ $t('about.cta.title') }}
      </h2>
      <p class="mt-3 max-w-xl leading-relaxed text-muted">
        {{ $t('about.cta.body') }}
      </p>
      <div class="mt-7 flex flex-wrap gap-2">
        <UButton
          to="/subscriptions"
          :label="$t('about.cta.openLedger')"
          color="primary"
          variant="outline"
        />
        <UButton
          to="/"
          :label="$t('about.cta.dashboard')"
          color="neutral"
          variant="link"
        />
      </div>
    </UContainer>
  </div>
</template>
