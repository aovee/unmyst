<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const colorMode = useColorMode()

const items: DropdownMenuItem[] = [
  { label: 'Light', icon: 'i-lucide-sun', onSelect: () => (colorMode.preference = 'light') },
  { label: 'Dark', icon: 'i-lucide-moon', onSelect: () => (colorMode.preference = 'dark') },
  {
    label: 'System',
    icon: 'i-lucide-monitor',
    onSelect: () => (colorMode.preference = 'system')
  }
]
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'end' }">
    <UButton
      color="neutral"
      variant="outline"
      size="sm"
      square
      aria-label="Toggle theme"
    >
      <UIcon name="i-lucide-sun" class="size-5 dark:hidden" />
      <UIcon name="i-lucide-moon" class="hidden size-5 dark:block" />
    </UButton>
  </UDropdownMenu>
</template>
