<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { format } from 'date-fns'
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{ subscription?: Subscription }>()
const emit = defineEmits<{ success: [] }>()

const toast = useToast()
const isEdit = computed(() => Boolean(props.subscription))

const cycleOptions = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Weekly', value: 'weekly' }
]

// Form state mirrors SubscriptionInputSchema (amount in euros, anchorDate string).
const state = reactive<Partial<SubscriptionInput>>({
  name: props.subscription?.name ?? '',
  amount: props.subscription ? props.subscription.amount / 100 : undefined,
  currency: props.subscription?.currency ?? 'EUR',
  cycle: props.subscription?.cycle ?? 'monthly',
  intervalCount: props.subscription?.intervalCount ?? 1,
  anchorDate: props.subscription
    ? format(props.subscription.anchorDate, 'yyyy-MM-dd')
    : ''
})

const pending = ref(false)

async function onSubmit(event: FormSubmitEvent<SubscriptionInput>) {
  pending.value = true
  try {
    if (isEdit.value) {
      await $fetch(`/api/subscriptions/${props.subscription!.id}`, {
        method: 'PUT',
        body: event.data
      })
    } else {
      await $fetch('/api/subscriptions', { method: 'POST', body: event.data })
    }
    toast.add({
      title: isEdit.value ? 'Subscription updated' : 'Subscription created',
      color: 'success'
    })
    emit('success')
  } catch (e) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: err.data?.message ?? err.statusMessage ?? 'Could not save. Please try again.',
      color: 'error'
    })
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UForm
    :schema="SubscriptionInputSchema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <UFormField label="Name" name="name">
      <UInput v-model="state.name" placeholder="Netflix" class="w-full" />
    </UFormField>

    <UFormField label="Price (€)" name="amount">
      <UInput
        v-model.number="state.amount"
        type="number"
        step="0.01"
        placeholder="15.99"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Billing cycle" name="cycle">
      <USelect v-model="state.cycle" :items="cycleOptions" class="w-full" />
    </UFormField>

    <UFormField label="Every N cycles" name="intervalCount">
      <UInput
        v-model.number="state.intervalCount"
        type="number"
        min="1"
        class="w-full"
      />
    </UFormField>

    <UFormField label="First billing date" name="anchorDate">
      <UInput v-model="state.anchorDate" type="date" class="w-full" />
    </UFormField>

    <div class="flex justify-between gap-2 pt-2">
      <slot name="cancel" />
      <UButton type="submit" :loading="pending" icon="i-lucide-check">
        {{ pending ? 'Saving…' : 'Confirm' }}
      </UButton>
    </div>
  </UForm>
</template>
