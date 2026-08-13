<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{
  sub: Subscription
}>()

const { logoUrl } = useServiceLogo()

const initials = computed<string>(
  () => props.sub.service.trim().charAt(0).toUpperCase() || '?'
)

const trialLabel = computed<string>(() => {
  const left = trialDaysLeft(props.sub)

  if (left === null) return ''
  if (left === 0) return 'Trial — ends today'
  return `Trial — ${left} day${left === 1 ? '' : 's'} left`
})

const nextRenewalDate = computed<Date>(() =>
  computeNextRenewal(new Date(props.sub.anchorDate), props.sub.cycle, props.sub.intervalCount)
)

const locale = useLocale()
const nextBilling = computed<string>(() => formatRelativeDate(nextRenewalDate.value, locale))

const cycle = computed<string>(() => {
  const { sub } = props
  const unit = sub.cycle.replace('ly', '')

  return sub.intervalCount > 1 ? `${sub.intervalCount} ${unit}s` : unit
})
</script>

<template>
  <UCard class="relative overflow-hidden" :ui="{ body: 'flex flex-col gap-4' }">
    <div class="absolute top-0 left-0 w-full h-1 bg-primary-800" />

    <div class="flex flex-col gap-2">
      <UAvatar
        :src="logoUrl(sub.service) ?? undefined"
        :text="initials"
        :alt="sub.service"
        size="lg"
        class="shrink-0 bg-elevated"
      />

      <div class="mt-4">
        <div class="font-semibold text-lg line-clamp-1">
          {{ sub.service }}
        </div>
        <div v-if="sub.description" class="text-sm text-muted line-clamp-1">
          {{ sub.description }}
        </div>
      </div>
    </div>

    <USeparator />

    <div class="grid grid-cols-2 gap-6 items-center justify-between">
      <div class="text-muted text-sm">
        Next billing
      </div>
      <div class="text-end">
        <UBadge
          v-if="isInTrial(sub)"
          :color="sub.automaticConversion ? 'warning' : 'neutral'"
          :variant="sub.automaticConversion ? 'subtle' : 'outline'"
          :icon="sub.automaticConversion ? 'i-lucide-alert-triangle' : 'i-lucide-hourglass'"
          :title="`Trial ends ${formatDate(trialEndDate(sub)!, locale)}`"
        >
          {{ trialLabel }}
        </UBadge>
        <UTooltip v-else :delay-duration="0" :text="formatDate(nextRenewalDate, locale)">
          <span class="text-sm">{{ nextBilling }}</span>
        </UTooltip>
      </div>
      <div class="text-muted text-sm">
        / {{ cycle }}
      </div>
      <div class="text-end">
        <span class="text-2xl">{{ formatCurrency(sub.amount, sub.currency, locale) }}</span>
        <div v-if="isInTrial(sub)" class="text-xs text-muted">
          after trial
        </div>
        <div v-else-if="isShared(sub)" class="text-xs text-muted">
          your share
          <span>{{ formatCurrency(personalAmount(sub), sub.currency, locale) }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>
