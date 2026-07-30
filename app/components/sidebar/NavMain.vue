<script setup lang="ts">
interface NavItem {
  title: string
  url: string
  icon: string
}

defineProps<{ items: NavItem[] }>()
const emit = defineEmits<{ navigate: [] }>()

const route = useRoute()
function isActive(url: string) {
  if (url === '/') return route.path === '/'
  return route.path === url || route.path.startsWith(`${url}/`)
}
</script>

<template>
  <nav class="flex flex-col gap-1 p-2">
    <NuxtLink
      v-for="item in items"
      :key="item.url"
      :to="item.url"
      class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
      :class="
        isActive(item.url)
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
      "
      @click="emit('navigate')"
    >
      <UIcon :name="item.icon" class="size-4" />
      <span>{{ item.title }}</span>
    </NuxtLink>
  </nav>
</template>
