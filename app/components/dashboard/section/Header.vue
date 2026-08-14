<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2">
    <div class="flex items-center gap-2">
      <UIcon v-if="icon" :name="icon" class="size-4 text-primary" />
      <slot name="title">
        <h3 v-if="title" class="font-medium text-highlighted">
          {{ title }}
        </h3>
      </slot>
    </div>
    <slot name="description">
      <span v-if="description" class="text-sm text-muted">
        {{ description }}
      </span>
    </slot>
  </div>
</template>
