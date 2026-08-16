<script setup lang="ts">
const locale = useLocale()
// Illustrative mini-dashboard for the hero (static product mock). Reuses the
// real dashboard's copy keys so it stays bilingual, and the app's initial-avatar
// fallback so no external logos are fetched. Amounts in cents, formatted in the
// active locale like the rest of the app.
const heroPreview = {
  billedMonthly: 12051,
  averagedWeek: 2593,
  renewals: [
    { service: 'Netflix', inDays: 3, amount: 1799 },
    { service: 'Spotify', inDays: 9, amount: 708 },
    { service: 'iCloud+', inDays: 12, amount: 299 }
  ]
}
</script>

<template>
  <div class="relative mx-auto w-full max-w-md">
    <!-- soft glow behind the card -->
    <div class="pointer-events-none absolute -inset-6 -z-10 rounded-full bg-primary/10 blur-3xl" />

    <div class="overflow-hidden rounded-xl border border-default bg-elevated/50 shadow-2xl backdrop-blur-sm">
      <!-- window bar -->
      <div class="flex items-center gap-2 border-b border-default px-4 py-2.5">
        <img
          src="/unmyst-mark-dark.svg"
          alt=""
          width="18"
          height="18"
        >
        <span class="font-title text-sm text-highlighted">unmyst</span>
        <span class="ml-auto text-[10px] uppercase tracking-[0.14em] text-dimmed">
          {{ $t('nav.dashboard') }}
        </span>
      </div>

      <div class="space-y-4 p-4">
        <!-- stat tiles -->
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-lg border border-default bg-default p-3">
            <div class="text-[10px] uppercase tracking-[0.12em] text-dimmed">
              {{ $t('dashboard.actuallyBilled.billedEach.monthly') }}
            </div>
            <div class="mt-1 font-numbers text-lg font-semibold text-highlighted tabular-nums">
              {{ formatCurrency(heroPreview.billedMonthly, 'EUR', locale) }}
            </div>
          </div>
          <div class="rounded-lg border border-primary/20 bg-primary/10 p-3">
            <div class="text-[10px] uppercase tracking-[0.12em] text-dimmed">
              {{ $t('dashboard.averaged.perWeek') }}
            </div>
            <div class="mt-1 font-numbers text-lg font-semibold text-primary tabular-nums">
              ≈ {{ formatCurrency(heroPreview.averagedWeek, 'EUR', locale) }}
            </div>
          </div>
        </div>

        <!-- upcoming renewals -->
        <div>
          <div class="mb-2 flex items-center gap-1.5 text-dimmed">
            <UIcon name="i-lucide-calendar-clock" class="size-3.5" />
            <span class="text-[10px] uppercase tracking-[0.12em]">
              {{ $t('dashboard.upcomingRenewals.title') }}
            </span>
          </div>
          <div class="flex flex-col divide-y divide-default/70">
            <div
              v-for="r in heroPreview.renewals"
              :key="r.service"
              class="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
            >
              <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-elevated text-[11px] font-medium text-muted">
                {{ r.service.charAt(0) }}
              </span>
              <div class="min-w-0 flex-1">
                <div class="truncate text-xs font-medium text-highlighted">
                  {{ r.service }}
                </div>
                <div class="text-[10px] text-dimmed">
                  {{ $t('relative.inDays', r.inDays) }}
                </div>
              </div>
              <span class="font-numbers text-xs text-muted tabular-nums">
                {{ formatCurrency(r.amount, 'EUR', locale) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
