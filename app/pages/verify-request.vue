<script setup lang="ts">
definePageMeta({ layout: 'security' })

const route = useRoute()

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

const email = computed(() => first(route.query.email as string | string[] | undefined))
const redirectTo = computed(() =>
  first(route.query.redirectTo as string | string[] | undefined)
)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col items-center gap-2">
      <NuxtLink to="/">
        <AppLogo />
      </NuxtLink>
      <div class="flex flex-col items-center gap-4 text-center">
        <h1 class="text-xl font-bold">
          Verify your email
        </h1>
        <p class="text-sm text-muted-foreground">
          An activation link has been sent to your email address. Please check your
          inbox and click on the link to complete the activation process.
        </p>
      </div>
      <div class="mt-5 text-center">
        <AuthResendButton
          v-if="email"
          :email="email"
          :redirect-to="redirectTo"
        />
        <p v-else class="text-sm text-muted-foreground">
          Didn't get the mail?
          <NuxtLink to="/login" class="text-primary underline-offset-4 hover:underline">
            Try again
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
