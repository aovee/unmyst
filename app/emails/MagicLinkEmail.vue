<script setup lang="ts">
import { computed } from 'vue'
// Branded magic-link email. One template, parameterised for both variants
// (returning users get the "sign in" copy, new addresses get "welcome / confirm")
// — the server picks the copy in server/utils/auth-email.ts.
//
// Table-based E-components with inline styles are the lowest common denominator
// that renders consistently across Gmail, Outlook and Apple Mail. The logo is a
// PNG referenced by absolute URL, built from the magic link's origin so it points
// at the same host the user requested from (SVG isn't email-safe); the `alt`
// keeps the brand name visible when images are blocked.
interface Props {
  heading?: string
  intro?: string
  buttonLabel?: string
  url?: string
  outro?: string
  host?: string
}

const props = withDefaults(defineProps<Props>(), {
  heading: 'Sign in to your account',
  intro: 'Click the button below to sign in to Unmyst. This link expires in 24 hours and can only be used once.',
  buttonLabel: 'Sign in',
  url: 'https://unmyst.app/api/auth/verify?token=preview',
  outro: 'For your security, this link works only in the browser you requested it from.',
  host: 'unmyst.app'
})

const APP_NAME = 'Unmyst'
const BRAND = '#41aea6'

const logoSrc = computed(() => `${new URL(props.url).origin}/unmyst-lockup-light.png`)

const main = {
  margin: '0',
  padding: '0',
  background: '#f4f4f5',
  fontFamily: '-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif'
}
const card = {
  maxWidth: '480px',
  background: '#ffffff',
  borderRadius: '12px',
  padding: '40px',
  border: '1px solid #e4e4e7'
}
const headingStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#18181b',
  margin: '20px 0 12px'
}
const introStyle = { fontSize: '14px', lineHeight: '22px', color: '#52525b', margin: '0 0 24px' }
const buttonStyle = {
  background: BRAND,
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  borderRadius: '8px',
  padding: '12px 24px'
}
const outroStyle = { fontSize: '13px', lineHeight: '20px', color: '#71717a', margin: '24px 0 0' }
const fallbackStyle = {
  fontSize: '12px',
  lineHeight: '18px',
  color: '#a1a1aa',
  margin: '16px 0 0',
  paddingTop: '16px',
  borderTop: '1px solid #f4f4f5'
}
const linkStyle = { color: BRAND, wordBreak: 'break-all' as const }
const footerStyle = { fontSize: '12px', color: '#a1a1aa', margin: '24px 0 0' }
</script>

<template>
  <EHtml lang="en">
    <EHead />
    <EPreview>{{ intro }}</EPreview>
    <EBody :style="main">
      <ESection style="padding: 32px 0;">
        <EContainer :style="card">
          <EImg
            :src="logoSrc"
            :alt="APP_NAME"
            height="50"
          />

          <EHeading :style="headingStyle">
            {{ heading }}
          </EHeading>

          <EText :style="introStyle">
            {{ intro }}
          </EText>

          <EButton :href="url" :style="buttonStyle">
            {{ buttonLabel }}
          </EButton>

          <EText :style="outroStyle">
            {{ outro }}
          </EText>

          <EText :style="fallbackStyle">
            Or paste this link into your browser:<br>
            <ELink :href="url" :style="linkStyle">
              {{ url }}
            </ELink>
          </EText>

          <EText :style="footerStyle">
            If you didn't request this, you can safely ignore this email. Sent for {{ host }}.
          </EText>
        </EContainer>
      </ESection>
    </EBody>
  </EHtml>
</template>
