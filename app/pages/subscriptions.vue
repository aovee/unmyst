<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Subscriptions · Unmyst' })

const { data: subs, refresh } = await useFetch<Subscription[]>('/api/subscriptions', {
  default: () => []
})
</script>

<template>
  <div class="@container/main flex flex-col gap-4 md:gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">My subscriptions</h1>
      <SubscriptionsAddDialog @saved="refresh" />
    </div>

    <SubscriptionsDataCards :subscriptions="subs" />

    <SubscriptionsTable :subscriptions="subs" @refresh="refresh" />
  </div>
</template>
