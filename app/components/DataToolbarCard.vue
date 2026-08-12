<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  description: string
}>()
</script>

<template>
  <div class="ring ring-default w-full p-4 flex flex-col gap-3">
    <div class="uppercase text-xs text-muted tracking-wider font-semibold">
      {{ title }}
    </div>
    <div class="font-numbers font-semibold text-3xl">
      {{ value }}
    </div>
    <div class="text-xs text-muted">
      {{ description }}
    </div>
  </div>
</template>
