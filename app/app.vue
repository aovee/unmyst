<script setup lang="ts">
const colorMode = useColorMode()
const { t, locale } = useI18n()
const route = useRoute()
const { public: { siteUrl } } = useRuntimeConfig()

const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')

const ogImage = `${siteUrl}/og.png`
// Absolute URL of the current (already locale-prefixed) path for og:url.
const ogUrl = computed(() => `${siteUrl}${route.path}`)
// og:locale (underscore form) for the active language, with the other as alternate.
const ogLocale = computed(() => (locale.value === 'fr' ? 'fr_FR' : 'en_GB'))
const ogLocaleAlt = computed(() => (locale.value === 'fr' ? 'en_GB' : 'fr_FR'))

// i18n supplies html lang/dir, the canonical link, and the hreflang alternates
// (+ og:locale) for the active locale — one source of truth for localized SEO.
const i18nHead = useLocaleHead()

useHead(() => ({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs?.lang,
    dir: i18nHead.value.htmlAttrs?.dir
  },
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color.value },
    ...(i18nHead.value.meta ?? [])
  ],
  link: [
    { rel: 'icon', href: '/unmyst-favicon-32.png' },
    ...(i18nHead.value.link ?? [])
  ],
  titleTemplate: '%s - Unmyst'
}))

const title = 'Unmyst'
const description = computed(() => t('app.description'))

useSeoMeta({
  title,
  description,
  ogType: 'website',
  ogSiteName: 'Unmyst',
  ogUrl: () => ogUrl.value,
  ogTitle: title,
  ogDescription: description,
  ogImage,
  ogLocale: () => ogLocale.value,
  ogLocaleAlternate: () => ogLocaleAlt.value,
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
