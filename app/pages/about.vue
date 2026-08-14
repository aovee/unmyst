<script setup lang="ts">
const { t } = useI18n()
const locale = useLocale()

definePageMeta({ layout: 'front', middleware: 'auth' })

useHead({ title: () => t('about.title') })

const stats = computed(() => [
  { value: t('about.stats.plansValue'), label: t('about.stats.plans') },
  { value: t('about.stats.typicalValue'), label: t('about.stats.typical') },
  { value: t('about.stats.billedValue'), label: t('about.stats.billed') },
  { value: t('about.stats.dataValue'), label: t('about.stats.data') }
])

const counts = computed(() => [
  { n: '01', title: t('about.howItCounts.one.title'), body: t('about.howItCounts.one.body'), example: t('about.howItCounts.one.example') },
  { n: '02', title: t('about.howItCounts.two.title'), body: t('about.howItCounts.two.body'), example: t('about.howItCounts.two.example') },
  { n: '03', title: t('about.howItCounts.three.title'), body: t('about.howItCounts.three.body'), example: t('about.howItCounts.three.example') }
])

const dataRows = computed(() => [
  { label: t('about.data.tracked'), value: t('about.data.trackedValue') },
  { label: t('about.data.since'), value: t('about.data.sinceValue') },
  { label: t('about.data.total'), value: t('about.data.totalValue') },
  { label: t('about.data.storage'), value: t('about.data.storageValue') },
  { label: t('about.data.lastBackup'), value: t('about.data.lastBackupValue') }
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
  { service: 'World of Warcraft', charge: 13188, cycle: 'yearly', levelled: 1099 },
  { service: 'Spotify Duo', charge: 2124, cycle: 'monthly', levelled: 708 }
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
      <p class="mt-6 max-w-xl leading-relaxed text-muted">
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

    <!-- Stats band — illustrative figures from one example ledger -->
    <div class="border-y border-primary/15 bg-primary/10">
      <UContainer class="py-8">
        <p class="mb-5 text-[11px] uppercase tracking-[0.16em] text-dimmed">
          {{ $t('about.stats.caption') }}
        </p>
        <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div v-for="stat in stats" :key="stat.label">
            <div class="font-title text-2xl font-semibold text-highlighted md:text-[1.7rem]">
              {{ stat.value }}
            </div>
            <div class="mt-1.5 text-[11px] uppercase leading-tight tracking-[0.13em] text-dimmed">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </UContainer>
    </div>

    <!-- How it counts -->
    <UContainer id="how-it-counts" class="scroll-mt-20 py-16 md:py-20">
      <p :class="eyebrow">
        {{ $t('about.howItCounts.eyebrow') }}
      </p>
      <div class="mt-8 flex flex-col">
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
              <p class="mt-3 font-numbers text-[13px] text-primary">
                {{ item.example }}
              </p>
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
          <div class="mt-6 flex flex-wrap gap-2">
            <UButton
              to="/subscriptions"
              :label="$t('about.data.exportJson')"
              color="primary"
              variant="outline"
              size="sm"
            />
            <UButton
              to="/subscriptions"
              :label="$t('about.data.importBackup')"
              color="primary"
              variant="outline"
              size="sm"
            />
          </div>
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
            <dd class="font-numbers text-sm text-highlighted">
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

    <!-- Quote -->
    <UContainer class="py-16 md:py-20">
      <blockquote class="max-w-2xl">
        <p class="font-title text-2xl font-medium leading-snug text-highlighted md:text-[1.7rem]">
          “{{ $t('about.quote.text') }}”
        </p>
        <footer class="mt-4 text-sm text-dimmed">
          — {{ $t('about.quote.attribution') }}
        </footer>
      </blockquote>
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
