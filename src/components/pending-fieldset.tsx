'use client'

import { useFormStatus } from 'react-dom'

type PendingFieldsetProps = React.ComponentProps<'fieldset'>

export function PendingFieldset({ children, ...props }: PendingFieldsetProps) {
  const { pending } = useFormStatus()

  return (
    <fieldset disabled={pending} {...props}>
      {children}
    </fieldset>
  )
}
