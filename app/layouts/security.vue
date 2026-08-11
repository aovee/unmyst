<template>
  <div
    class="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10"
  >
    <div class="flex w-full max-w-sm flex-col gap-6">
      <NuxtLink to="/" class="flex justify-center">
        <AppLogo size="lg" />
      </NuxtLink>

      <slot />
    </div>
  </div>
</template>
