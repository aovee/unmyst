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
    title="Edit Subscription"
    description="Edit infos about your subscription then click &quot;Confirm&quot;."
  >
    <template #body>
      <SubscriptionForm :subscription="subscription" @success="onSuccess">
        <template #cancel>
          <UButton color="neutral" variant="outline" @click="open = false">
            Cancel
          </UButton>
        </template>
      </SubscriptionForm>
    </template>
  </UModal>
</template>
