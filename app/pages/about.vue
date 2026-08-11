<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useHead({ title: 'About' })

const features = [{
  icon: 'i-lucide-credit-card',
  title: 'Track every subscription',
  description: 'Keep all your recurring services in one place — cost, billing cycle and renewal date at a glance.'
}, {
  icon: 'i-lucide-calendar',
  title: 'Never miss a renewal',
  description: 'A renewal calendar and upcoming-renewals list show exactly what is due, so surprise charges become a thing of the past.'
}, {
  icon: 'i-lucide-trending-up',
  title: 'Forecast your spend',
  description: 'See what your subscriptions add up to over the months ahead and understand where your money is going.'
}, {
  icon: 'i-lucide-list',
  title: 'Spot the big ones',
  description: 'Your top subscriptions are surfaced automatically, making it easy to decide what to keep and what to cancel.'
}]
</script>

<template>
  <UDashboardPanel id="about">
    <template #header>
      <UDashboardNavbar title="About">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-3xl space-y-8">
        <div class="space-y-3">
          <AppLogo />
          <p class="text-lg text-toned">
            unmyst takes the mystery out of your subscriptions. It gives you a
            single, clear view of everything you pay for on a recurring basis —
            what it costs, when it renews and how it all adds up over time.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UCard v-for="feature in features" :key="feature.title" variant="outline">
            <div class="flex items-start gap-3">
              <UIcon :name="feature.icon" class="mt-0.5 size-5 shrink-0 text-primary" />
              <div class="space-y-1">
                <p class="font-medium text-highlighted">
                  {{ feature.title }}
                </p>
                <p class="text-sm text-muted">
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </UCard>
        </div>

        <div class="space-y-3">
          <h2 class="text-base font-semibold text-highlighted">
            How it works
          </h2>
          <p class="text-toned">
            Add each of your subscriptions with its price and billing cycle.
            unmyst builds your dashboard from there — a calendar of what's due,
            a forecast of what's ahead and a breakdown of where your money goes.
            Everything stays private to your account, and your data is yours to
            manage or remove at any time.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <UButton
            to="/"
            icon="i-lucide-house"
            color="neutral"
            variant="outline"
          >
            Go to dashboard
          </UButton>
          <UButton
            to="/subscriptions"
            icon="i-lucide-credit-card"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-arrow-right"
          >
            Manage subscriptions
          </UButton>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
