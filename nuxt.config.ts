// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxthub/core',
    'nuxt-auth-utils',
    'nuxt-charts'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    databaseUrl: '',
    resendKey: '',
    emailFrom: '',
    oauth: {
      google: {
        clientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET
      }
    },
    public: {
      // Logo.dev publishable token (pk_…), used to render service logos.
      // Publishable keys are safe to expose client-side. Override with
      // NUXT_PUBLIC_LOGO_DEV_TOKEN if you rotate it.
      logoDevToken: 'pk_ZNuSO5CdRsiAmSPcnOX8rA'
    },
    session: {
      name: process.env.SESSION_COOKIE_NAME || 'unmyst_session',
      password: process.env.NUXT_SESSION_PASSWORD || '',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      cookie: {
        maxAge: 60 * 60 * 24 * 7 // persist cookie across browser restarts
      }
    }
  },

  routeRules: {
    '/api/**': {
      cors: true
    }
  },

  compatibilityDate: '2026-06-30',

  hub: {
    db: {
      dialect: 'postgresql'
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
