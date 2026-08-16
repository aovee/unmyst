<script setup lang="ts">
const { t } = useI18n()
useHead({ title: () => t('auth.login.title') })
// Utility page — keep it out of the search index.
useSeoMeta({ robots: 'noindex, follow' })

const route = useRoute()
const callbackUrl = computed(() => {
  const cb = route.query.callbackUrl
  return Array.isArray(cb) ? cb[0] : (cb ?? undefined)
})
</script>

<template>
  <AuthForm mode="login" :callback-url="callbackUrl ?? undefined" />
</template>
