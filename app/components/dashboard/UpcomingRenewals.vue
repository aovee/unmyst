<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{
  subscriptions: Subscription[]
  windowDays?: number
}>()

const locale = useLocale()
const { t } = useI18n()
const { logoUrl } = useServiceLogo()

function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

const horizon = computed(() => props.windowDays ?? 30)

const { renewals, total } = useUpcomingRenewals(
  () => props.subscriptions,
  { windowDays: horizon }
)

function relativeLabel(inDays: number): string {
  if (inDays === 0) return t('relative.today')
  if (inDays === 1) return t('relative.tomorrow')
  return t('relative.inDays', inDays)
}
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <DashboardSectionHeader
        icon="i-lucide-calendar-clock"
        :title="$t('dashboard.upcomingRenewals.title')"
      >
        <template #description>
          <div class="text-sm text-muted">
            <span class="font-semibold text-default tabular-nums">
              {{ formatCurrency(total, undefined, locale) }}
            </span>
            {{ $t('dashboard.upcomingRenewals.due', { days: horizon }) }}
          </div>
        </template>
      </DashboardSectionHeader>
    </template>

    <div v-if="renewals.length" class="flex flex-col divide-y divide-default">
      <div
        v-for="r in renewals"
        :key="r.sub.id"
        class="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
      >
        <UAvatar
          :src="logoUrl(r.sub.service) ?? undefined"
          :text="initials(r.sub.service)"
          :alt="r.sub.service"
          size="sm"
          class="shrink-0 bg-elevated"
        />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5">
            <span class="truncate text-sm font-medium">{{ r.sub.service }}</span>
            <UIcon
              v-if="r.isTrialEnd && r.sub.automaticConversion"
              name="i-lucide-alert-triangle"
              class="size-3.5 shrink-0 text-warning"
              :title="$t('dashboard.upcomingRenewals.trialConverts')"
            />
          </div>
          <div class="text-xs" :class="r.isTrialEnd ? 'text-warning' : 'text-muted'">
            <span v-if="r.isTrialEnd">{{ $t('dashboard.upcomingRenewals.trialEnds') }}</span>
            {{ formatDate(r.date, locale) }} · {{ relativeLabel(r.inDays) }}
          </div>
        </div>
        <div class="shrink-0 text-right text-sm font-medium tabular-nums">
          {{ formatCurrency(r.amount, r.sub.currency, locale) }}
          <div v-if="r.isTrialEnd" class="text-xs font-normal text-muted">
            {{ $t('dashboard.upcomingRenewals.firstCharge') }}
          </div>
          <div v-else-if="isShared(r.sub)" class="text-xs font-normal text-muted">
            {{ $t('dashboard.upcomingRenewals.of', { amount: formatCurrency(r.sub.amount, r.sub.currency, locale) }) }}
          </div>
        </div>
      </div>
    </div>

    <div v-else class="py-6 text-center text-sm text-muted">
      {{ $t('dashboard.upcomingRenewals.empty', { days: horizon }) }}
    </div>
  </UCard>
</template>
