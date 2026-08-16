<script setup lang="ts">
import type { Subscription, PriceHistory } from '~~/server/db/schema'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const router = useRouter()
const locale = useLocale()
const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { logoUrl } = useServiceLogo()

const id = computed(() => route.params.id as string)

const { data, refresh, error } = await useFetch<{ subscription: Subscription, history: PriceHistory[] }>(
  () => `/api/subscriptions/${id.value}`,
  { key: `subscription-detail-${id.value}` }
)

const sub = computed(() => data.value?.subscription ?? null)
const history = computed(() => data.value?.history ?? [])

useHead({ title: () => sub.value?.service ?? t('subscription.detail.title') })

const initials = computed(() => sub.value?.service.trim().charAt(0).toUpperCase() || '?')
const shared = computed(() => (sub.value ? isShared(sub.value) : false))

// Newest period first for the timeline; the open period (effectiveTo === null) leads.
const timeline = computed(() => [...history.value].reverse())

const evolution = computed(() => priceEvolution(history.value))
const evolutionPct = computed(() => {
  if (!evolution.value) return ''
  const pct = Math.round(evolution.value.pctChange * 100)
  return `${pct >= 0 ? '+' : ''}${pct}%`
})

function totalPaid(personal: boolean): number {
  if (!sub.value) return 0
  return totalPaidToDate(
    history.value,
    {
      anchorDate: sub.value.anchorDate,
      trialDurationDays: sub.value.trialDurationDays,
      intervalCount: sub.value.intervalCount
    },
    { personal }
  )
}
const totalPersonal = computed(() => totalPaid(true))
const totalFull = computed(() => totalPaid(false))

function cycleLabel(cycle: Subscription['cycle']): string {
  return t(`cycle.${cycle}`)
}

// Edit + delete wiring (reuses the existing dialog and delete endpoint).
const editOpen = ref(false)
const deleteOpen = ref(false)
const deleting = ref(false)

async function confirmDelete() {
  if (!sub.value) return
  deleting.value = true
  try {
    await $fetch(`/api/subscriptions/${sub.value.id}`, { method: 'DELETE' })
    toast.add({ title: t('subscription.delete.success'), color: 'success' })
    router.push(localePath('/dashboard/subscriptions'))
  } catch {
    toast.add({ title: t('subscription.delete.error'), color: 'error' })
    deleting.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="subscription-detail">
    <template #header>
      <AppNavbar :title="sub?.service ?? $t('subscription.detail.title')">
        <template #right>
          <UButton
            :to="localePath('/dashboard/subscriptions')"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            size="sm"
            :label="$t('subscription.detail.back')"
          />
          <UButton
            v-if="sub"
            icon="i-lucide-pencil"
            color="neutral"
            variant="outline"
            size="sm"
            :label="$t('common.edit')"
            @click="editOpen = true"
          />
          <UButton
            v-if="sub"
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            :label="$t('common.delete')"
            @click="deleteOpen = true"
          />
        </template>
      </AppNavbar>
    </template>

    <template #body>
      <div v-if="error" class="py-12 text-center text-muted">
        {{ $t('subscription.detail.notFound') }}
      </div>

      <div v-else-if="sub" class="flex flex-col gap-8">
        <!-- Identity + current price -->
        <div class="flex items-center gap-4">
          <UAvatar
            :src="logoUrl(sub.service) ?? undefined"
            :text="initials"
            :alt="sub.service"
            size="xl"
            class="shrink-0 bg-elevated"
          />
          <div class="min-w-0">
            <div class="truncate text-xl font-semibold text-highlighted">
              {{ sub.service }}
            </div>
            <div class="text-sm text-muted">
              {{ formatCurrency(sub.amount, sub.currency, locale) }} · {{ cycleLabel(sub.cycle) }}
              <span v-if="shared" class="text-dimmed">
                · {{ $t('subscription.card.yourShare') }}
                {{ formatCurrency(personalAmount(sub), sub.currency, locale) }}
              </span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Total paid to date -->
          <UCard variant="outline">
            <template #header>
              <DashboardSectionHeader
                icon="i-lucide-wallet"
                :title="$t('subscription.detail.totalPaid')"
                :description="$t('subscription.detail.totalPaidHint')"
              />
            </template>
            <div class="font-numbers text-3xl font-semibold text-highlighted tabular-nums">
              {{ formatCurrency(totalPersonal, sub.currency, locale) }}
            </div>
            <div v-if="shared" class="mt-1 text-sm text-muted">
              {{ $t('subscription.detail.fullCost', {
                amount: formatCurrency(totalFull, sub.currency, locale)
              }) }}
            </div>
          </UCard>

          <!-- Price evolution -->
          <UCard variant="outline">
            <template #header>
              <DashboardSectionHeader
                icon="i-lucide-trending-up"
                :title="$t('subscription.history.title')"
              />
            </template>

            <i18n-t
              v-if="evolution && evolution.first !== evolution.current"
              keypath="subscription.history.evolution"
              tag="p"
              class="mb-4 text-sm text-muted"
            >
              <template #from>
                <span class="font-numbers text-default">{{ formatCurrency(evolution.first, sub.currency, locale) }}</span>
              </template>
              <template #to>
                <span class="font-numbers text-default">{{ formatCurrency(evolution.current, sub.currency, locale) }}</span>
              </template>
              <template #pct>
                <span :class="evolution.pctChange >= 0 ? 'text-warning' : 'text-success'">{{ evolutionPct }}</span>
              </template>
              <template #date>
                {{ formatDate(evolution.since, locale) }}
              </template>
            </i18n-t>

            <div class="flex flex-col divide-y divide-default">
              <div
                v-for="row in timeline"
                :key="row.id"
                class="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-numbers text-sm font-medium text-highlighted tabular-nums">
                      {{ formatCurrency(row.amount, row.currency, locale) }}
                    </span>
                    <span class="text-xs text-dimmed">{{ cycleLabel(row.cycle) }}</span>
                    <UBadge
                      v-if="row.source === 'correction'"
                      color="neutral"
                      variant="subtle"
                      size="sm"
                    >
                      {{ $t('subscription.history.source.correction') }}
                    </UBadge>
                  </div>
                  <div class="text-xs text-muted">
                    {{ formatDate(row.effectiveFrom, locale) }} —
                    <template v-if="row.effectiveTo">
                      {{ formatDate(row.effectiveTo, locale) }}
                    </template>
                    <span v-else class="text-primary">{{ $t('subscription.history.current') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Edit modal -->
  <SubscriptionEditDialog
    v-if="sub"
    v-model:open="editOpen"
    :subscription="sub"
    @saved="refresh"
  />

  <!-- Delete confirmation -->
  <UModal
    v-model:open="deleteOpen"
    :title="$t('subscription.delete.title')"
    :description="$t('subscription.delete.description')"
  >
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="outline" @click="deleteOpen = false">
          {{ $t('common.cancel') }}
        </UButton>
        <UButton color="error" :loading="deleting" @click="confirmDelete">
          {{ $t('common.delete') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
