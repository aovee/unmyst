<script setup lang="ts">
const colorMode = useColorMode()
const { t, locale } = useI18n()
const route = useRoute()
const { public: { siteUrl } } = useRuntimeConfig()

const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')

// Absolute canonical for the current path (no query string), so variants don't
// read as duplicates.
const canonical = computed(() => `${siteUrl}${route.path}`)
const ogImage = `${siteUrl}/og.png`
// og:locale wants an underscore form; map from the active language.
const ogLocale = computed(() => (locale.value === 'fr' ? 'fr_FR' : 'en_GB'))

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/unmyst-favicon-32.png' },
    { rel: 'canonical', href: () => canonical.value }
  ],
  htmlAttrs: {
    lang: () => locale.value
  },
  titleTemplate: '%s - Unmyst'
})

const title = 'Unmyst'
const description = computed(() => t('app.description'))

useSeoMeta({
  title,
  description,
  ogType: 'website',
  ogSiteName: 'Unmyst',
  ogUrl: () => canonical.value,
  ogTitle: title,
  ogDescription: description,
  ogImage,
  ogLocale: () => ogLocale.value,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: ogImage
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
