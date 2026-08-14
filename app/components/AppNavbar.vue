<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <UDashboardNavbar
    :ui="{ title: 'flex flex-col items-start gap-1 py-3', right: 'justify-start' }"
  >
    <template #title>
      <span class="text-xl md:text-2xl">
        {{ title }}
      </span>
      <div class="hidden md:block text-xs text-muted">
        {{ description }}
      </div>
    </template>
    <template #right>
      <slot name="right" />
    </template>
  </UDashboardNavbar>
</template>
