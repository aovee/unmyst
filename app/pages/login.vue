<script setup lang="ts">
definePageMeta({ layout: 'security' })

const route = useRoute()
const callbackUrl = computed(() => {
  const cb = route.query.callbackUrl
  return Array.isArray(cb) ? cb[0] : (cb ?? undefined)
})
</script>

<template>
  <AuthLoginForm :callback-url="callbackUrl ?? undefined" />
</template>
