<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

const props = defineProps<{ subscription: Subscription }>()
const emit = defineEmits<{ saved: [] }>()
const open = defineModel<boolean>('open', { default: false })

const { pause } = useSubscriptionLifecycle()

// Optional planned resume date (yyyy-mm-dd); empty = paused indefinitely.
const resumeAt = ref<string>('')
const saving = ref(false)

// Reset the field each time the dialog opens.
watch(open, (isOpen) => {
  if (isOpen) resumeAt.value = ''
})

async function confirm() {
  saving.value = true
  const ok = await pause(props.subscription.id, resumeAt.value || null)
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
    :title="$t('subscription.pause.title', { service: subscription.service })"
    :description="$t('subscription.pause.description')"
  >
    <template #body>
      <UFormField
        :label="$t('subscription.pause.resumeLabel')"
        :help="$t('subscription.pause.resumeHelp')"
      >
        <UInput v-model="resumeAt" type="date" class="w-full" />
      </UFormField>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="outline" @click="open = false">
          {{ $t('common.cancel') }}
        </UButton>
        <UButton
          color="warning"
          icon="i-lucide-pause"
          :loading="saving"
          @click="confirm"
        >
          {{ $t('subscription.pause.confirm') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
