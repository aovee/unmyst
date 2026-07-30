export default defineAppConfig({
  ui: {
    // The brand is a teal (~oklch(0.687 0.099 188.29)); Tailwind's `teal` is the
    // closest named ramp, so Nuxt UI's semantic `primary` maps to it.
    colors: {
      primary: 'teal',
      neutral: 'neutral'
    }
  }
})
