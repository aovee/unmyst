<script setup lang="ts">
const { t, locale, locales, setLocale } = useI18n()

const APP_VERSION = 'v0.4.2'
const BUILD_DATE = new Date('2026-08-14')

const buildLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short', year: 'numeric' })
    .format(BUILD_DATE)
)

const navLinks = computed(() => [
  { label: t('front.nav.howItCounts'), to: '#how-it-counts' },
  { label: t('front.nav.yourData'), to: '#your-data' },
  { label: t('front.nav.limits'), to: '#limits' }
])

const footerLinks = computed(() => [
  { label: t('front.footer.source'), to: '#' },
  { label: t('front.footer.report'), to: '#' },
  { label: t('front.footer.licence'), to: '#' }
])

const otherLocale = computed(() => locales.value.find(l => l.code !== locale.value))
</script>

<template>
  <div class="dark flex min-h-svh flex-col bg-default text-default">
    <header class="sticky top-0 z-20 border-b border-default bg-default/80 backdrop-blur">
      <UContainer class="flex h-16 items-center justify-between gap-6">
        <ULink to="/about" class="flex items-center gap-2">
          <img
            src="/unmyst-mark-dark.svg"
            alt=""
            width="26"
            height="26"
            class="shrink-0"
          >
          <span class="font-title text-lg text-highlighted">unmyst</span>
        </ULink>

        <nav class="hidden items-center gap-1 md:flex">
          <UButton
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            :label="link.label"
            color="neutral"
            variant="link"
          />
        </nav>

        <UButton
          to="/subscriptions"
          :label="$t('front.nav.openLedger')"
          color="primary"
          variant="outline"
          size="sm"
        />
      </UContainer>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-default">
      <UContainer class="flex flex-col gap-4 py-8 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2 text-sm text-muted">
            <img
              src="/unmyst-mark-dark.svg"
              alt=""
              width="16"
              height="16"
            >
            {{ $t('front.footer.version', { version: APP_VERSION, date: buildLabel }) }}
          </div>
          <p class="text-xs text-dimmed">
            {{ $t('front.footer.madeBy') }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-1">
          <UButton
            v-for="link in footerLinks"
            :key="link.label"
            :to="link.to"
            :label="link.label"
            color="primary"
            variant="link"
            size="sm"
          />
          <UButton
            v-if="otherLocale"
            :label="otherLocale.code.toUpperCase()"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="setLocale(otherLocale.code)"
          />
        </div>
      </UContainer>
    </footer>
  </div>
</template>
