<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{ sub: Subscription }>()

const locale = useLocale()
const { t } = useI18n()

// Only paused / canceled warrant a badge; active is the unmarked default.
const badge = computed(() => {
  if (props.sub.status === 'paused') {
    const resume = props.sub.resumeAt
      ? t('subscription.status.pausedUntil', { date: formatDate(new Date(props.sub.resumeAt), locale.value) })
      : t('subscription.status.paused')
    return { label: resume, color: 'warning' as const, icon: 'i-lucide-pause' }
  }
  if (props.sub.status === 'canceled') {
    const label = props.sub.canceledAt
      ? t('subscription.status.canceledOn', { date: formatDate(new Date(props.sub.canceledAt), locale.value) })
      : t('subscription.status.canceled')
    return { label, color: 'neutral' as const, icon: 'i-lucide-x-circle' }
  }
  return null
})
</script>

<template>
  <UBadge
    v-if="badge"
    :color="badge.color"
    variant="subtle"
    size="sm"
    :icon="badge.icon"
    class="w-fit"
  >
    {{ badge.label }}
  </UBadge>
</template>
