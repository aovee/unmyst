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
  service: props.subscription?.service ?? '',
  description: props.subscription?.description ?? '',
  amount: props.subscription ? props.subscription.amount / 100 : undefined,
  currency: props.subscription?.currency ?? 'EUR',
  cycle: props.subscription?.cycle ?? 'monthly',
  intervalCount: props.subscription?.intervalCount ?? 1,
  shareCount: props.subscription?.shareCount ?? 1,
  trialDurationDays: props.subscription?.trialDurationDays ?? null,
  automaticConversion: props.subscription?.automaticConversion ?? false,
  anchorDate: props.subscription
    ? format(props.subscription.anchorDate, 'yyyy-MM-dd')
    : ''
})

const pending = ref(false)

// A checkbox drives the trial section; unchecking it clears the fields so we
// don't submit a stale duration.
const hasTrial = ref(Boolean(props.subscription?.trialDurationDays))
watch(hasTrial, (on) => {
  if (on) {
    state.trialDurationDays ||= 30
  } else {
    state.trialDurationDays = null
    state.automaticConversion = false
  }
})

// Live preview of the user's own share once the cost is split.
const yourShare = computed(() => {
  const shares = state.shareCount && state.shareCount > 0 ? state.shareCount : 1
  if (shares <= 1 || !state.amount) return null
  return formatCurrency(Math.round((state.amount * 100) / shares), state.currency)
})

// Bridge the nullable state field to UInput, which models `number | undefined`.
const trialDurationModel = computed({
  get: () => state.trialDurationDays ?? undefined,
  set: (v: number | undefined) => {
    state.trialDurationDays = v ?? null
  }
})

// Live preview of when the trial ends, derived from the anchor date.
const trialEndPreview = computed(() => {
  if (!state.trialDurationDays || !state.anchorDate) return null
  const end = trialEndDate({
    anchorDate: state.anchorDate,
    trialDurationDays: state.trialDurationDays
  })
  return end ? formatDate(end) : null
})

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
    <UFormField label="Service" name="service">
      <UInput v-model="state.service" placeholder="Netflix" class="w-full" />
    </UFormField>

    <UFormField label="Description" name="description">
      <UInput
        v-model="state.description"
        placeholder="Family plan"
        class="w-full"
      />
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

    <UFormField
      label="Split between"
      name="shareCount"
      help="Number of people sharing the cost equally, including you. Leave at 1 if it's all yours."
    >
      <UInput
        v-model.number="state.shareCount"
        type="number"
        min="1"
        class="w-full"
      />
      <p v-if="yourShare" class="mt-1 text-xs text-muted">
        Your share: <span class="font-medium text-default">{{ yourShare }}</span>
      </p>
    </UFormField>

    <UFormField
      :label="hasTrial ? 'Trial start date' : 'First billing date'"
      name="anchorDate"
    >
      <UInput v-model="state.anchorDate" type="date" class="w-full" />
    </UFormField>

    <div class="rounded-lg border border-default p-3">
      <UCheckbox
        v-model="hasTrial"
        label="Starts with a free trial"
        help="During the trial it counts as €0 today, but still appears in your run-rate."
      />

      <div v-if="hasTrial" class="mt-3 space-y-3">
        <UFormField label="Trial length (days)" name="trialDurationDays">
          <UInput
            v-model.number="trialDurationModel"
            type="number"
            min="1"
            placeholder="30"
            class="w-full"
          />
          <p v-if="trialEndPreview" class="mt-1 text-xs text-muted">
            Trial ends <span class="font-medium text-default">{{ trialEndPreview }}</span>
          </p>
        </UFormField>

        <UFormField name="automaticConversion">
          <UCheckbox
            v-model="state.automaticConversion"
            label="Converts to paid automatically"
            help="A payment method is attached — it'll start charging when the trial ends."
          />
        </UFormField>
      </div>
    </div>

    <div class="flex justify-between gap-2 pt-2">
      <slot name="cancel" />
      <UButton type="submit" :loading="pending" icon="i-lucide-check">
        {{ pending ? 'Saving…' : 'Confirm' }}
      </UButton>
    </div>
  </UForm>
</template>
