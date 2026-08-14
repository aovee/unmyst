<script setup lang="ts">
const { t } = useI18n()
useHead({ title: () => t('verify.title') })

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
      <div class="flex flex-col items-center gap-4 text-center">
        <h1 class="text-xl font-bold">
          {{ $t('verify.title') }}
        </h1>
        <p class="text-sm text-muted-foreground">
          {{ $t('verify.body') }}
        </p>
      </div>
      <div class="mt-5 text-center">
        <AuthResendButton
          v-if="email"
          :email="email"
          :redirect-to="redirectTo"
        />
        <p v-else class="text-sm text-muted-foreground">
          {{ $t('verify.noMail') }}
          <NuxtLink to="/login" class="text-primary underline-offset-4 hover:underline">
            {{ $t('verify.tryAgain') }}
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
