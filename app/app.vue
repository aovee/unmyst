<script setup lang="ts">
useHead({
  title: 'Unmyst',
  meta: [
    { name: 'description', content: 'See clearly between your subscriptions' }
  ],
  link: [{ rel: 'icon', href: '/favicon.svg' }],
  htmlAttrs: { lang: DEFAULT_LOCALE }
})
</script>

<template>
  <!-- UApp provides the toast + tooltip + overlay providers (replaces the old
       TooltipProvider / Toaster / theme-provider wrappers from layout.tsx). -->
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
