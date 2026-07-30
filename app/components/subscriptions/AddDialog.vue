<script setup lang="ts">
const emit = defineEmits<{ saved: [] }>()
const open = ref(false)

function onSuccess() {
  open.value = false
  emit('saved')
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="New Subscription"
    description='Fill out infos about your newly subscribed service and click "Confirm".'
  >
    <UButton icon="i-lucide-plus" color="neutral" variant="outline">
      Add Subscription
    </UButton>

    <template #body>
      <SubscriptionsSubscriptionForm @success="onSuccess">
        <template #cancel>
          <UButton color="neutral" variant="outline" @click="open = false">
            Cancel
          </UButton>
        </template>
      </SubscriptionsSubscriptionForm>
    </template>
  </UModal>
</template>
