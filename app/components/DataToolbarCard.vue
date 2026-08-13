<script setup lang="ts">
defineProps<{
  title?: string
  value?: string | number
  description?: string
  fullWidth?: boolean
}>()
</script>

<template>
  <div
    class="ring ring-default w-full py-4 px-8 flex flex-col gap-3"
    :class="fullWidth ? 'col-span-1 sm:col-span-2 lg:col-span-4' : ''"
  >
    <slot name="content">
      <div class="uppercase text-xs text-muted tracking-widest font-semibold">
        {{ title }}
      </div>
      <div class="font-semibold text-3xl">
        {{ value }}
      </div>
      <div class="text-xs text-muted">
        {{ description }}
      </div>
    </slot>
  </div>
</template>
