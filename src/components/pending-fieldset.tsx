'use client'

import { useFormStatus } from 'react-dom'

export function PendingFieldset({
  children,
  ...props
}: React.ComponentProps<'fieldset'>) {
  const { pending } = useFormStatus()

  return (
    <fieldset disabled={pending} {...props}>
      {children}
    </fieldset>
  )
}
