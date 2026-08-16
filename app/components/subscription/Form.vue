<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { format } from 'date-fns'
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{ subscription?: Subscription }>()
const emit = defineEmits<{ success: [] }>()

const toast = useToast()
const { t } = useI18n()
const isEdit = computed(() => Boolean(props.subscription))

const cycleOptions = computed(() => [
  { label: t('cycle.monthly'), value: 'monthly' },
  { label: t('cycle.yearly'), value: 'yearly' },
  { label: t('cycle.weekly'), value: 'weekly' }
])

// Seed the category combobox with suggestions; include the current value (which
// may be a custom one) so it renders as selected when editing.
const categoryItems = ref<string[]>([
  ...new Set([
    ...CATEGORY_SUGGESTIONS,
    ...(props.subscription?.category ? [props.subscription.category] : [])
  ])
])
function onCategoryCreate(value: string) {
  categoryItems.value.push(value)
  state.category = value
}
// Bridge the nullable state field to UInputMenu, which models `string | undefined`.
const categoryModel = computed({
  get: () => state.category ?? undefined,
  set: (v: string | undefined) => {
    state.category = v ?? null
  }
})

// Form state mirrors SubscriptionInputSchema (amount in euros, anchorDate string).
const state = reactive<Partial<SubscriptionInput>>({
  service: props.subscription?.service ?? '',
  description: props.subscription?.description ?? '',
  category: props.subscription?.category ?? null,
  amount: props.subscription ? props.subscription.amount / 100 : undefined,
  annualPrice: props.subscription?.annualPrice != null ? props.subscription.annualPrice / 100 : null,
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

// Bridge the nullable state field to UInput, which models `string | undefined`.
const descriptionModel = computed({
  get: () => state.description ?? undefined,
  set: (v: string | undefined) => {
    state.description = v ?? null
  }
})

// Optional annual price only makes sense for monthly plans; drop any stale value
// when the cycle changes so it's never submitted for a non-monthly plan.
watch(() => state.cycle, (cycle) => {
  if (cycle !== 'monthly') state.annualPrice = null
})

// Bridge the nullable annual-price field to UInput (`number | undefined`).
const annualPriceModel = computed({
  get: () => state.annualPrice ?? undefined,
  set: (v: number | undefined) => {
    state.annualPrice = v ?? null
  }
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
      title: isEdit.value ? t('subscription.form.saved') : t('subscription.form.created'),
      color: 'success'
    })
    emit('success')
  } catch (e) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: err.data?.message ?? err.statusMessage ?? t('subscription.form.error'),
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
    <UFormField :label="$t('subscription.form.service')" name="service">
      <UInput v-model="state.service" :placeholder="$t('subscription.form.servicePlaceholder')" class="w-full" />
    </UFormField>

    <UFormField :label="$t('subscription.form.description')" name="description">
      <UInput
        v-model="descriptionModel"
        :placeholder="$t('subscription.form.descriptionPlaceholder')"
        class="w-full"
      />
    </UFormField>

    <UFormField :label="$t('subscription.form.category')" name="category">
      <UInputMenu
        v-model="categoryModel"
        :items="categoryItems"
        create-item
        :placeholder="$t('subscription.form.categoryPlaceholder')"
        class="w-full"
        @create="onCategoryCreate"
      />
    </UFormField>

    <UFormField :label="$t('subscription.form.price')" name="amount">
      <UInput
        v-model.number="state.amount"
        type="number"
        step="0.01"
        :placeholder="$t('subscription.form.pricePlaceholder')"
        class="w-full"
      />
    </UFormField>

    <UFormField :label="$t('subscription.form.cycle')" name="cycle">
      <USelect v-model="state.cycle" :items="cycleOptions" class="w-full" />
    </UFormField>

    <UFormField :label="$t('subscription.form.intervalCount')" name="intervalCount">
      <UInput
        v-model.number="state.intervalCount"
        type="number"
        min="1"
        class="w-full"
      />
    </UFormField>

    <UFormField
      v-if="state.cycle === 'monthly'"
      :label="$t('subscription.form.annualPrice')"
      name="annualPrice"
      :help="$t('subscription.form.annualPriceHelp')"
    >
      <UInput
        v-model.number="annualPriceModel"
        type="number"
        step="0.01"
        min="0"
        :placeholder="$t('subscription.form.annualPricePlaceholder')"
        class="w-full"
      />
    </UFormField>

    <UFormField
      :label="$t('subscription.form.shareCount')"
      name="shareCount"
      :help="$t('subscription.form.shareCountHelp')"
    >
      <UInput
        v-model.number="state.shareCount"
        type="number"
        min="1"
        class="w-full"
      />
      <p v-if="yourShare" class="mt-1 text-xs text-muted">
        {{ $t('subscription.form.yourShare') }} <span class="font-medium text-default">{{ yourShare }}</span>
      </p>
    </UFormField>

    <UFormField
      :label="hasTrial ? $t('subscription.form.trialStartDate') : $t('subscription.form.firstBillingDate')"
      name="anchorDate"
    >
      <UInput v-model="state.anchorDate" type="date" class="w-full" />
    </UFormField>

    <div class="rounded-lg border border-default p-3">
      <UCheckbox
        v-model="hasTrial"
        :label="$t('subscription.form.hasTrial')"
        :help="$t('subscription.form.hasTrialHelp')"
      />

      <div v-if="hasTrial" class="mt-3 space-y-3">
        <UFormField :label="$t('subscription.form.trialLength')" name="trialDurationDays">
          <UInput
            v-model.number="trialDurationModel"
            type="number"
            min="1"
            :placeholder="$t('subscription.form.trialLengthPlaceholder')"
            class="w-full"
          />
          <i18n-t
            v-if="trialEndPreview"
            keypath="subscription.form.trialEnds"
            tag="p"
            class="mt-1 text-xs text-muted"
          >
            <template #date>
              <span class="font-medium text-default">{{ trialEndPreview }}</span>
            </template>
          </i18n-t>
        </UFormField>

        <UFormField name="automaticConversion">
          <UCheckbox
            v-model="state.automaticConversion"
            :label="$t('subscription.form.automaticConversion')"
            :help="$t('subscription.form.automaticConversionHelp')"
          />
        </UFormField>
      </div>
    </div>

    <div class="flex justify-between gap-2 pt-2">
      <slot name="cancel" />
      <UButton type="submit" :loading="pending" icon="i-lucide-check">
        {{ pending ? $t('common.saving') : $t('common.confirm') }}
      </UButton>
    </div>
  </UForm>
</template>
