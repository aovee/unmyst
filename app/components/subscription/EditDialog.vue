<script setup lang="ts">
import type { Subscription } from '~~/server/db/schema'

defineProps<{ subscription: Subscription }>()
const emit = defineEmits<{ saved: [] }>()
const open = defineModel<boolean>('open', { default: false })

function onSuccess() {
  open.value = false
  emit('saved')
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="$t('subscription.edit.title')"
    :description="$t('subscription.edit.description')"
  >
    <template #body>
      <SubscriptionForm :subscription="subscription" @success="onSuccess">
        <template #cancel>
          <UButton color="neutral" variant="outline" @click="open = false">
            {{ $t('common.cancel') }}
          </UButton>
        </template>
      </SubscriptionForm>
    </template>
  </UModal>
</template>
