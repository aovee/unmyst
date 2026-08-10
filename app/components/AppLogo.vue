<script setup lang="ts">
withDefaults(defineProps<{
  collapsed?: boolean
  to?: string
  solo?: boolean
}>(), {
  collapsed: false,
  solo: false
})

const ULink = resolveComponent('ULink')
</script>

<template>
  <component :is="to ? ULink : 'div'" :to="to" class="flex items-center gap-2">
    <UAvatar v-if="collapsed" src="/logo-solo.svg" />
    <UColorModeImage
      v-else
      :light="solo ? '/logo-solo.svg' : '/logo-full-light.svg'"
      :dark="solo ? '/logo-solo.svg' : '/logo-full-dark.svg'"
      :width="150"
      :height="40"
    />
  </component>
</template>
