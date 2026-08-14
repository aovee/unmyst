<script setup lang="ts">
const { t } = useI18n()
useHead({ title: () => t('auth.signup.title') })

const route = useRoute()
const callbackUrl = computed(() => {
  const cb = route.query.callbackUrl
  return Array.isArray(cb) ? cb[0] : (cb ?? undefined)
})
</script>

<template>
  <AuthForm mode="signup" :callback-url="callbackUrl ?? undefined" />
</template>
