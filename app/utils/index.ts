// Chart segment colors, resolved from the static Tailwind theme. `unmyst` is
// the brand primary; the rest are default palette hues for category slices.
export const CHART_COLORS = [
  'var(--color-unmyst-500)',
  'var(--color-sky-500)',
  'var(--color-violet-500)',
  'var(--color-amber-500)',
  'var(--color-rose-500)',
  'var(--color-emerald-500)',
  'var(--color-cyan-500)',
  'var(--color-fuchsia-500)'
] as const

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}
