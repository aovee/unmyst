<script setup lang="ts">
withDefaults(defineProps<{
  headline?: string
  title?: string
  description?: string
  orientation?: 'vertical' | 'horizontal'
}>(), {
  orientation: 'vertical'
})
</script>

<template>
  <div class="scroll-mt-20 py-16 md:py-20">
    <div :class="orientation === 'horizontal' ? 'grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center' : ''">
      <div>
        <p v-if="headline" class="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {{ headline }}
        </p>
        <h2 v-if="title" class="mt-4 max-w-2xl font-title text-2xl font-semibold leading-tight text-highlighted">
          {{ title }}
        </h2>
        <p v-if="description" class="mt-4 max-w-2xl leading-relaxed text-muted">
          {{ description }}
        </p>
      </div>

      <slot />
    </div>
  </div>
</template>
