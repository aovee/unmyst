<script setup lang="ts">
const emit = defineEmits<{ toggle: [] }>()
</script>

<template>
  <header
    class="flex h-14 shrink-0 items-center gap-2 border-b border-border"
  >
    <div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
      <UButton
        icon="i-lucide-panel-left"
        color="neutral"
        variant="ghost"
        size="sm"
        class="md:hidden"
        aria-label="Toggle sidebar"
        @click="emit('toggle')"
      />
      <USeparator orientation="vertical" class="mx-2 h-4 md:hidden" />
      <h1 class="text-base font-medium">Unmyst</h1>
      <ModeToggle class="ml-auto" />
    </div>
  </header>
</template>
