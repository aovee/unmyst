<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const { loggedIn, user, clear } = useUserSession()

const colorMode = useColorMode()

const items = computed<DropdownMenuItem[][]>(() => {
  if (!loggedIn.value || !user.value) {
    return []
  }

  return [[{
    type: 'label',
    label: user.value.name ?? '',
    avatar: {
      src: user.value.image ?? undefined
    }
  }], [{
    label: 'Appearance',
    icon: 'i-lucide-sun-moon',
    children: [{
      label: 'Light',
      icon: 'i-lucide-sun',
      type: 'checkbox',
      checked: colorMode.value === 'light',
      onUpdateChecked(checked: boolean) {
        if (checked) {
          colorMode.preference = 'light'
        }
      },
      onSelect(e: Event) {
        e.preventDefault()
      }
    }, {
      label: 'Dark',
      icon: 'i-lucide-moon',
      type: 'checkbox',
      checked: colorMode.value === 'dark',
      onUpdateChecked(checked: boolean) {
        if (checked) {
          colorMode.preference = 'dark'
        }
      },
      onSelect(e: Event) {
        e.preventDefault()
      }
    }]
  }], [{
    label: 'Log out',
    icon: 'i-lucide-log-out',
    onSelect() {
      clear()
      navigateTo('/login')
    }
  }]]
})
</script>

<template>
  <UDropdownMenu
    v-if="loggedIn && user"
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      :avatar="user?.image ? { src: user.image } : undefined"
      :label="collapsed ? undefined : user?.name ?? undefined"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{ trailingIcon: 'text-dimmed' }"
    />
  </UDropdownMenu>
</template>
