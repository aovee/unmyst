<script setup lang="ts">
definePageMeta({ layout: 'security' })

useHead({ title: 'Sign up' })

const route = useRoute()
const callbackUrl = computed(() => {
  const cb = route.query.callbackUrl
  return Array.isArray(cb) ? cb[0] : (cb ?? undefined)
})
</script>

<template>
  <AuthForm mode="signup" :callback-url="callbackUrl ?? undefined" />
</template>
