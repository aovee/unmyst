<script setup lang="ts">
const active = ref<boolean>(true)
</script>

<template>
  <div class="flex items-center gap-1 p-1 rounded-md ring ring-default">
    <UButton size="xs" label="Timing" :variant="active ? 'solid' : 'link'" />
    <UButton size="xs" label="Cost" variant="link" />
    <UButton size="xs" label="Name" variant="link" />
  </div>
</template>
