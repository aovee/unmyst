<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{ subscriptions: Subscription[] }>()
const emit = defineEmits<{ refresh: [] }>()

const locale = useLocale()
const { t } = useI18n()
const toast = useToast()
const { logoUrl } = useServiceLogo()

function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

const { suggestions } = useAnnualPlanSuggestions(() => props.subscriptions)

// Ids currently being dismissed, so the button can show a spinner / stay disabled.
const dismissing = ref<Set<string>>(new Set())

async function dismiss(sub: Subscription) {
  if (dismissing.value.has(sub.id)) return
  dismissing.value = new Set(dismissing.value).add(sub.id)
  try {
    await $fetch(`/api/subscriptions/${sub.id}/suggestion-dismiss`, { method: 'POST' })
    emit('refresh')
  } catch {
    toast.add({ title: t('dashboard.savings.dismissError'), color: 'error' })
  } finally {
    const next = new Set(dismissing.value)
    next.delete(sub.id)
    dismissing.value = next
  }
}
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <DashboardSectionHeader
        icon="i-lucide-piggy-bank"
        :title="$t('dashboard.savings.title')"
        :description="$t('dashboard.savings.description')"
      />
    </template>

    <div v-if="suggestions.length" class="flex flex-col divide-y divide-default">
      <div
        v-for="s in suggestions"
        :key="s.sub.id"
        class="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
      >
        <UAvatar
          :src="logoUrl(s.sub.service) ?? undefined"
          :text="initials(s.sub.service)"
          :alt="s.sub.service"
          size="sm"
          class="shrink-0 bg-elevated"
        />
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-medium">
            {{ s.sub.service }}
          </div>
          <div class="text-xs text-muted tabular-nums">
            {{ $t('dashboard.savings.currentMonthly', {
              amount: formatCurrency(personalAmount(s.sub), s.sub.currency, locale)
            }) }}
          </div>
        </div>

        <div class="shrink-0 text-right">
          <div class="text-sm font-semibold text-success tabular-nums">
            {{ $t('dashboard.savings.save', {
              amount: formatCurrency(s.saving, s.sub.currency, locale)
            }) }}
          </div>
          <div v-if="s.isEstimate" class="text-xs text-dimmed">
            {{ $t('dashboard.savings.estimate') }}
          </div>
        </div>

        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          :loading="dismissing.has(s.sub.id)"
          :aria-label="$t('dashboard.savings.dismiss')"
          :title="$t('dashboard.savings.dismiss')"
          @click="dismiss(s.sub)"
        />
      </div>
    </div>

    <div v-else class="py-6 text-center text-sm text-muted">
      {{ $t('dashboard.savings.empty') }}
    </div>
  </UCard>
</template>
