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
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'pill',
          active: true,
          class: {
            link: 'before:bg-primary text-inverted dark:before:bg-primary-800 dark:text-primary',
            linkLeadingIcon: 'text-inverted group-data-[state=open]:text-inverted dark:text-primary dark:group-data-[state=open]:text-primary'
          }
        }
      ]
    }
  }
})
