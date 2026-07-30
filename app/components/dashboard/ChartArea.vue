<script setup lang="ts">
// Lightweight self-contained area chart (replaces the Recharts demo). Generates
// deterministic pseudo-random demo data so there's no external chart dependency.
const points = Array.from({ length: 30 }, (_, i) => {
  const base = 200 + Math.sin(i / 3) * 60 + (i * 4)
  const noise = ((i * 9301 + 49297) % 233280) / 233280
  return Math.round(base + noise * 80)
})

const W = 800
const H = 240
const max = Math.max(...points)
const min = Math.min(...points)

function x(i: number) {
  return (i / (points.length - 1)) * W
}
function y(v: number) {
  const t = (v - min) / (max - min || 1)
  return H - t * (H - 20) - 10
}

const linePath = computed(() =>
  points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
)
const areaPath = computed(() => `${linePath.value} L ${W} ${H} L 0 ${H} Z`)
</script>

<template>
  <UCard>
    <div class="mb-1 text-sm font-medium">Total Visitors</div>
    <div class="mb-4 text-sm text-muted-foreground">For the last 30 days</div>
    <svg :viewBox="`0 0 ${W} ${H}`" class="h-56 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.4" />
          <stop offset="100%" stop-color="var(--primary)" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path :d="areaPath" fill="url(#area-fill)" />
      <path :d="linePath" fill="none" stroke="var(--primary)" stroke-width="2" />
    </svg>
  </UCard>
</template>
