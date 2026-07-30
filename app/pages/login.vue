<script setup lang="ts">
const route = useRoute()
const callbackUrl = computed(() => {
  const cb = route.query.callbackUrl
  return Array.isArray(cb) ? cb[0] : (cb ?? undefined)
})
</script>

<template>
  <AuthLoginForm :callback-url="callbackUrl ?? undefined" />
</template>
