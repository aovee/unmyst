<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const props = defineProps<{
  user: { name: string; email: string; avatar: string }
}>()

const colorMode = useColorMode()
const { clear } = useUserSession()

const initials = computed(() => {
  const source = props.user.name || props.user.email || '?'
  return (
    source
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  )
})

async function logout() {
  await clear()
  await navigateTo('/login')
}

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Light',
      icon: 'i-lucide-sun',
      type: 'checkbox' as const,
      checked: colorMode.preference === 'light',
      onUpdateChecked: () => (colorMode.preference = 'light')
    },
    {
      label: 'Dark',
      icon: 'i-lucide-moon',
      type: 'checkbox' as const,
      checked: colorMode.preference === 'dark',
      onUpdateChecked: () => (colorMode.preference = 'dark')
    },
    {
      label: 'System',
      icon: 'i-lucide-sparkles',
      type: 'checkbox' as const,
      checked: colorMode.preference === 'system',
      onUpdateChecked: () => (colorMode.preference = 'system')
    }
  ],
  [{ label: 'Log out', icon: 'i-lucide-log-out', onSelect: logout }]
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'end', side: 'top' }"
    :ui="{ content: 'min-w-56' }"
  >
    <button
      class="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-sidebar-accent/60"
    >
      <UAvatar :src="user.avatar || undefined" :alt="user.name" :text="initials" size="sm" />
      <div class="grid flex-1 text-sm leading-tight">
        <span class="truncate font-medium">{{ user.name }}</span>
        <span class="truncate text-xs text-muted-foreground">{{ user.email }}</span>
      </div>
      <UIcon name="i-lucide-chevrons-up-down" class="ml-auto size-4" />
    </button>
  </UDropdownMenu>
</template>
