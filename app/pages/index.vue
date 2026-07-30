<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Dashboard · Unmyst' })
</script>

<template>
  <div class="@container/main flex flex-col gap-4 md:gap-6">
    <DashboardSectionCards />
    <DashboardChartArea />
    <DashboardDemoTable />
  </div>
</template>
