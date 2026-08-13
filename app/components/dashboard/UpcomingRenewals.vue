<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{
  subscriptions: Subscription[]
  windowDays?: number
}>()

const locale = useLocale()
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
  if (inDays === 0) return 'Today'
  if (inDays === 1) return 'Tomorrow'
  return `in ${inDays} days`
}
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <div class="flex flex-col lg:flex-row items-start lg:items-center gap-2">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-calendar-clock" class="size-4 text-primary" />
          <h3 class="text-sm font-medium text-highlighted">
            Upcoming renewals
          </h3>
        </div>
        <div class="text-sm text-muted">
          <span class="font-semibold text-default tabular-nums">
            {{ formatCurrency(total, undefined, locale) }}
          </span>
          due in {{ horizon }} days
        </div>
      </div>
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
              :title="'Trial converts to paid automatically'"
            />
          </div>
          <div class="text-xs" :class="r.isTrialEnd ? 'text-warning' : 'text-muted'">
            <span v-if="r.isTrialEnd">Trial ends · </span>
            {{ formatDate(r.date, locale) }} · {{ relativeLabel(r.inDays) }}
          </div>
        </div>
        <div class="shrink-0 text-right text-sm font-medium tabular-nums">
          {{ formatCurrency(r.amount, r.sub.currency, locale) }}
          <div v-if="r.isTrialEnd" class="text-xs font-normal text-muted">
            first charge
          </div>
          <div v-else-if="isShared(r.sub)" class="text-xs font-normal text-muted">
            of
            {{ formatCurrency(r.sub.amount, r.sub.currency, locale) }}
          </div>
        </div>
      </div>
    </div>

    <div v-else class="py-6 text-center text-sm text-muted">
      Nothing due in the next {{ horizon }} days.
    </div>
  </UCard>
</template>
