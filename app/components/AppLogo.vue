<script setup lang="ts">
const props = withDefaults(defineProps<{
  collapsed?: boolean
  to?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}>(), {
  collapsed: false,
  size: 'md'
})

const ULink = resolveComponent('ULink')

const logoSize = computed<number>(() => {
  switch (props.size) {
    case 'xs':
      return 20
    case 'sm':
      return 30
    case 'lg':
      return 50
    case 'xl':
      return 60
    case '2xl':
      return 70
    default:
      return 30
  }
})

const titleSize = computed<string>(() => {
  switch (props.size) {
    case 'xs':
      return 'text-lg'
    case 'sm':
      return 'text-xl'
    case 'lg':
      return 'text-3xl'
    case 'xl':
      return 'text-4xl'
    case '2xl':
      return 'text-5xl'
    default:
      return 'text-2xl'
  }
})
</script>

<template>
  <component :is="to ? ULink : 'div'" :to="to" class="flex items-center gap-2">
    <UColorModeImage
      light="/unmyst-mark-light.svg"
      dark="/unmyst-mark-dark.svg"
      :height="logoSize"
      :width="logoSize"
    />
    <div v-if="!collapsed" class="font-title text-highlighted" :class="titleSize">
      unmyst
    </div>
  </component>
</template>
