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
    :title="$t('subscription.add.title')"
    :description="$t('subscription.add.description')"
  >
    <UButton icon="i-lucide-plus" color="primary" variant="outline">
      {{ $t('subscription.add.button') }}
    </UButton>

    <template #body>
      <SubscriptionForm @success="onSuccess">
        <template #cancel>
          <UButton color="neutral" variant="outline" @click="open = false">
            Cancel
          </UButton>
        </template>
      </SubscriptionForm>
    </template>
  </UModal>
</template>
