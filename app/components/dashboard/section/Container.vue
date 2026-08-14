<script setup lang="ts">
const props = defineProps<{
  icon?: string
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-6">
    <section class="flex flex-col gap-3">
      <DashboardSectionHeader v-bind="props" />

      <slot name="content" />
    </section>
  </div>

  <div v-if="!!$slots.trailing" class="mt-4">
    <slot name="trailing" />
  </div>
</template>
