<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const { loggedIn, user, clear } = useUserSession()

const colorMode = useColorMode()
const { t, locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()

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
    label: t('userMenu.appearance'),
    icon: 'i-lucide-sun-moon',
    children: [{
      label: t('userMenu.light'),
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
      label: t('userMenu.dark'),
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
  }, {
    label: t('userMenu.language'),
    icon: 'i-lucide-languages',
    children: locales.value.map(l => ({
      label: l.name ?? l.code,
      type: 'checkbox' as const,
      checked: locale.value === l.code,
      onUpdateChecked(checked: boolean) {
        if (checked) {
          setLocale(l.code)
        }
      },
      onSelect(e: Event) {
        e.preventDefault()
      }
    }))
  }], [{
    label: t('userMenu.logout'),
    icon: 'i-lucide-log-out',
    onSelect() {
      clear()
      navigateTo(localePath('/'))
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
