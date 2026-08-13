<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <UDashboardNavbar :ui="{ title: 'flex flex-col items-start gap-1 py-3' }">
    <template #title>
      <span class="text-2xl">
        {{ title }}
      </span>
      <div class="text-xs text-muted">
        {{ description }}
      </div>
    </template>
    <template #right>
      <slot name="right" />
    </template>
  </UDashboardNavbar>
</template>
