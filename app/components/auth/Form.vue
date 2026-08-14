<script setup lang="ts">
// Magic-link auth doesn't distinguish signup from login: the user row is created
// on first verified link, so both modes post to the same endpoint and inherit its
// per-IP + per-email rate limiting. The only differences are the copy and the
// cross-link to the other screen.
const props = defineProps<{
  mode: 'login' | 'signup'
  callbackUrl?: string
}>()

const { t } = useI18n()

const copy = computed(() =>
  props.mode === 'signup'
    ? {
        prompt: t('auth.signup.prompt'),
        linkLabel: t('auth.signup.link'),
        linkTo: '/login',
        placeholder: t('auth.signup.placeholder'),
        submit: t('auth.signup.submit')
      }
    : {
        prompt: t('auth.login.prompt'),
        linkLabel: t('auth.login.link'),
        linkTo: '/signup',
        placeholder: t('auth.login.placeholder'),
        submit: t('auth.login.submit')
      }
)

const email = ref('')
const error = ref<string | null>(null)
const pending = ref(false)

const redirectTo = computed(() => props.callbackUrl || '/')

async function onSubmit() {
  error.value = null
  pending.value = true
  try {
    await $fetch('/api/auth/magic-link', {
      method: 'POST',
      body: { email: email.value, redirectTo: redirectTo.value }
    })
    await navigateTo({
      path: '/verify-request',
      query: {
        email: email.value,
        ...(redirectTo.value !== '/' ? { redirectTo: redirectTo.value } : {})
      }
    })
  } catch (e) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    error.value
      = err.data?.message
        ?? err.statusMessage
        ?? t('auth.genericError')
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="text-xl font-bold">
          {{ $t('auth.welcome') }}
        </h1>
        <p class="text-sm text-muted-foreground">
          {{ copy.prompt }}
          <NuxtLink
            :to="copy.linkTo"
            class="text-primary underline-offset-4 hover:underline"
          >
            {{ copy.linkLabel }}
          </NuxtLink>
        </p>
      </div>

      <fieldset :disabled="pending" class="flex flex-col gap-2">
        <UFormField :label="$t('auth.emailLabel')" :error="error ?? undefined" name="email">
          <UInput
            v-model="email"
            type="email"
            :placeholder="copy.placeholder"
            autocomplete="email"
            required
            class="w-full"
          />
        </UFormField>
        <UButton
          type="submit"
          block
          :loading="pending"
          class="mt-2"
        >
          {{ pending ? $t('common.sending') : copy.submit }}
        </UButton>
      </fieldset>

      <USeparator :label="$t('common.or')" />

      <UButton
        variant="outline"
        color="neutral"
        block
        icon="i-simple-icons-google"
        href="/auth/google"
        external
      >
        {{ $t('auth.google') }}
      </UButton>
    </form>

    <p class="px-6 text-center text-xs text-muted-foreground">
      <i18n-t keypath="auth.terms" tag="span">
        <template #terms>
          <a href="#" class="underline underline-offset-4">{{ $t('auth.termsOfService') }}</a>
        </template>
        <template #privacy>
          <a href="#" class="underline underline-offset-4">{{ $t('auth.privacyPolicy') }}</a>
        </template>
      </i18n-t>
    </p>
  </div>
</template>
