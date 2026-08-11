<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{
  subscriptions: Subscription[]
  limit?: number
}>()

const locale = useLocale()
const { logoUrl } = useServiceLogo()
const currency = computed(() => props.subscriptions[0]?.currency ?? 'EUR')
const max = computed(() => props.limit ?? 6)

function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

const rows = computed(() => {
  const ranked = props.subscriptions
    .map(s => ({
      name: s.name,
      amount: monthlyAmount(personalAmount(s), s.cycle, s.intervalCount)
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, max.value)

  const peak = ranked[0]?.amount ?? 0
  return ranked.map(r => ({
    ...r,
    width: peak > 0 ? `${Math.max(4, (r.amount / peak) * 100)}%` : '0%'
  }))
})
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-trophy" class="size-4 text-primary" />
        <h3 class="text-sm font-medium">
          Top subscriptions
        </h3>
        <span class="text-sm text-muted">Priciest, normalized per month</span>
      </div>
    </template>

    <div v-if="rows.length" class="flex flex-col gap-3.5">
      <div
        v-for="row in rows"
        :key="row.name"
        class="flex items-center gap-3"
      >
        <UAvatar
          :src="logoUrl(row.name) ?? undefined"
          :text="initials(row.name)"
          :alt="row.name"
          size="sm"
          class="shrink-0 bg-elevated"
        />
        <div class="min-w-0 flex-1">
          <div class="flex items-baseline justify-between gap-2 text-sm">
            <span class="truncate font-medium">{{ row.name }}</span>
            <span class="shrink-0 tabular-nums font-medium">
              {{ formatCurrency(row.amount, currency, locale) }}
              <span class="text-xs text-muted">/mo</span>
            </span>
          </div>
          <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-elevated">
            <div
              class="h-full rounded-full bg-primary transition-[width] duration-500"
              :style="{ width: row.width }"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="py-6 text-center text-sm text-muted">
      No subscriptions yet.
    </div>
  </UCard>
</template>
