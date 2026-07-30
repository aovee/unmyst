<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: number
    height?: number
    class?: string
  }>(),
  { width: 183, height: 48 }
)
</script>

<template>
  <!-- Two <img>s toggled by colour mode via the `dark:` variant, replacing
       next/image + the dark/light logo pair. -->
  <img
    src="/logo.svg"
    alt="Unmyst"
    :width="width"
    :height="height"
    :class="['w-auto dark:hidden', $props.class]"
  >
  <img
    src="/logo-dark.svg"
    alt="Unmyst"
    :width="width"
    :height="height"
    :class="['hidden w-auto dark:block', $props.class]"
  >
</template>
