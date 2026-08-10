export default defineAppConfig({
  ui: {
    colors: {
      primary: 'unmyst',
      neutral: 'mist'
    },
    card: {
      variants: {
        variant: {
          outline: {
            root: 'bg-elevated/20'
          }
        }
      }
    },
    navigationMenu: {
      slots: {
        linkLeadingIcon: 'size-4'
      },
      variants: {
        active: {
          false: {
            link: 'text-toned'
          }
        }
      }
    }
  }
})
