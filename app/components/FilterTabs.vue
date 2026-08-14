<script setup lang="ts">
const active = defineModel<string>()
defineProps<{
  label?: string
  items: PeriodFilter[]
}>()
</script>

<template>
  <div class="flex items-center gap-4">
    <span class="text-dimmed text-sm">{{ label }}</span>
    <div class="flex items-center gap-1 p-1 rounded-md ring ring-default">
      <UButton
        v-for="item in items"
        :key="item.value"
        size="xs"
        :label="item.label"
        :variant="active === item.value ? 'solid' : 'link'"
        class="cursor-pointer"
        @click="active = item.value"
      />
    </div>
  </div>
</template>
