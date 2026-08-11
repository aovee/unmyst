<script setup lang="ts">
const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/unmyst-favicon-32.png' }
  ],
  htmlAttrs: {
    lang: 'en'
  },
  titleTemplate: '%s - Unmyst'
})

const title = 'Unmyst'
const description = 'Finally see through all your subscriptions and memberships in one place. Unmyst is a subscription manager that helps you track, manage, and cancel your subscriptions with ease.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://unmyst.app/og.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
