'use client'

import { useActionState } from 'react'

import { resendMagicLink, type ActionState } from '@/components/auth/actions'
import { FieldDescription } from '@/components/ui/field'

type ResendButtonProps = {
  email: string
  redirectTo?: string
}

export function ResendButton({ email, redirectTo }: ResendButtonProps) {
  const initialState: ActionState = { ok: false, error: null }
  const [state, formAction, pending] = useActionState(
    resendMagicLink,
    initialState
  )

  return (
    <form action={formAction}>
      <input type="hidden" name="email" value={email} />
      {redirectTo ? (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      ) : null}
      <FieldDescription>
        Didn&apos;t get the mail?{' '}
        <button
          type="submit"
          disabled={pending}
          className="font-medium underline underline-offset-4 hover:text-primary disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Resend'}
        </button>
      </FieldDescription>
      {state.ok ? (
        <FieldDescription className="mt-2 text-primary">
          A new link is on its way to you.
        </FieldDescription>
      ) : null}
      {state.error ? (
        <FieldDescription className="mt-2 text-destructive">
          {state.error}
        </FieldDescription>
      ) : null}
    </form>
  )
}
