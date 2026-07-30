<script setup lang="ts">
// Static demo KPIs (ported from the shadcn dashboard sample). Placeholder data.
const cards = [
  { title: 'Total Revenue', value: '$1,250.00', delta: '+12.5%', up: true, foot: 'Trending up this month', sub: 'Visitors for the last 6 months' },
  { title: 'New Customers', value: '1,234', delta: '-20%', up: false, foot: 'Down 20% this period', sub: 'Acquisition needs attention' },
  { title: 'Active Accounts', value: '45,678', delta: '+12.5%', up: true, foot: 'Strong user retention', sub: 'Engagement exceed targets' },
  { title: 'Growth Rate', value: '4.5%', delta: '+4.5%', up: true, foot: 'Steady performance increase', sub: 'Meets growth projections' }
]
</script>

<template>
  <div class="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
    <UCard
      v-for="card in cards"
      :key="card.title"
      class="@container/card bg-linear-to-t from-primary/5 to-card"
    >
      <div class="flex items-start justify-between">
        <div class="text-sm text-muted-foreground">{{ card.title }}</div>
        <UBadge variant="outline" color="neutral" size="sm">
          <UIcon :name="card.up ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" />
          {{ card.delta }}
        </UBadge>
      </div>
      <div class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
        {{ card.value }}
      </div>
      <div class="mt-3 flex flex-col items-start gap-1.5 text-sm">
        <div class="line-clamp-1 flex items-center gap-2 font-medium">
          {{ card.foot }}
          <UIcon :name="card.up ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" class="size-4" />
        </div>
        <div class="text-muted-foreground">{{ card.sub }}</div>
      </div>
    </UCard>
  </div>
</template>
