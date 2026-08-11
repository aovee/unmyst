<script setup lang="ts">
// Magic-link auth doesn't distinguish signup from login: the user row is created
// on first verified link, so both modes post to the same endpoint and inherit its
// per-IP + per-email rate limiting. The only differences are the copy and the
// cross-link to the other screen.
const props = defineProps<{
  mode: 'login' | 'signup'
  callbackUrl?: string
}>()

const copy = computed(() =>
  props.mode === 'signup'
    ? {
        prompt: 'Already have an account?',
        linkLabel: 'Sign in',
        linkTo: '/login',
        placeholder: 'm@example.com',
        submit: 'Create Account'
      }
    : {
        prompt: 'Don\'t have an account?',
        linkLabel: 'Sign up',
        linkTo: '/signup',
        placeholder: 'you@example.com',
        submit: 'Login'
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
        ?? 'Something went wrong. Try again.'
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
          Welcome to Unmyst
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
        <UFormField label="Email" :error="error ?? undefined" name="email">
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
          {{ pending ? 'Sending…' : copy.submit }}
        </UButton>
      </fieldset>

      <USeparator label="or" />

      <UButton
        variant="outline"
        color="neutral"
        block
        icon="i-simple-icons-google"
        href="/auth/google"
        external
      >
        Continue with Google
      </UButton>
    </form>

    <p class="px-6 text-center text-xs text-muted-foreground">
      By clicking continue, you agree to our
      <a href="#" class="underline underline-offset-4">Terms of Service</a> and
      <a href="#" class="underline underline-offset-4">Privacy Policy</a>.
    </p>
  </div>
</template>
