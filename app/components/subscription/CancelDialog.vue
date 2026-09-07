<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{ subscription: Subscription }>()
const emit = defineEmits<{ saved: [] }>()
const open = defineModel<boolean>('open', { default: false })

const { cancel } = useSubscriptionLifecycle()

/** Local yyyy-mm-dd for today, used as the default cancellation date. */
function todayInput(): string {
  return new Date().toISOString().slice(0, 10)
}

const canceledAt = ref<string>(todayInput())
const saving = ref(false)

watch(open, (isOpen) => {
  if (isOpen) canceledAt.value = todayInput()
})

async function confirm() {
  saving.value = true
  const ok = await cancel(props.subscription.id, canceledAt.value || null)
  saving.value = false
  if (ok) {
    open.value = false
    emit('saved')
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="$t('subscription.cancel.title', { service: subscription.service })"
    :description="$t('subscription.cancel.description')"
  >
    <template #body>
      <UFormField
        :label="$t('subscription.cancel.dateLabel')"
        :help="$t('subscription.cancel.dateHelp')"
      >
        <UInput v-model="canceledAt" type="date" class="w-full" />
      </UFormField>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="outline" @click="open = false">
          {{ $t('common.cancel') }}
        </UButton>
        <UButton
          color="error"
          icon="i-lucide-x-circle"
          :loading="saving"
          @click="confirm"
        >
          {{ $t('subscription.cancel.confirm') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
