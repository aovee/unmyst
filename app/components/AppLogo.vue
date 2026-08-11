<script setup lang="ts">
withDefaults(defineProps<{
  collapsed?: boolean
  to?: string
}>(), {
  collapsed: false,
  solo: false
})

const ULink = resolveComponent('ULink')
</script>

<template>
  <component :is="to ? ULink : 'div'" :to="to" class="flex items-center gap-2">
    <UColorModeImage
      light="/unmyst-mark-light.svg"
      dark="/unmyst-mark-dark.svg"
      :height="42"
      :width="42"
    />
    <div v-if="!collapsed" class="font-title text-highlighted text-2xl">
      unmyst
    </div>
  </component>
</template>
