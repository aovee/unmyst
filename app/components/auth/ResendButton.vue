<script setup lang="ts">
const props = defineProps<{ email: string; redirectTo?: string }>()

const pending = ref(false)
const sent = ref(false)
const error = ref<string | null>(null)

async function resend() {
  error.value = null
  sent.value = false
  pending.value = true
  try {
    await $fetch('/api/auth/magic-link', {
      method: 'POST',
      body: { email: props.email, redirectTo: props.redirectTo ?? '/' }
    })
    sent.value = true
  } catch (e) {
    const err = e as { data?: { message?: string }; statusMessage?: string }
    error.value = err.data?.message ?? err.statusMessage ?? 'Could not resend.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div>
    <p class="text-sm text-muted-foreground">
      Didn't get the mail?
      <button
        type="button"
        :disabled="pending"
        class="font-medium underline underline-offset-4 hover:text-primary disabled:opacity-50"
        @click="resend"
      >
        {{ pending ? 'Sending…' : 'Resend' }}
      </button>
    </p>
    <p v-if="sent" class="mt-2 text-sm text-primary">
      A new link is on its way to you.
    </p>
    <p v-if="error" class="mt-2 text-sm text-error">{{ error }}</p>
  </div>
</template>
