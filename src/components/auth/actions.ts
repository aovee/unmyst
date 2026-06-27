'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { signIn } from '@/auth'
import { withEvlog, useLogger } from '@/lib/evlog'

export type ActionState = { ok: boolean; error: string | null }

const LoginSchema = z.object({
  email: z.email('Enter a valid email address')
})

const sendMagicLink = withEvlog(async (email: string) => {
  const log = useLogger()
  log.set({ action: 'login', email })
  // redirect: false → signIn returns instead of throwing NEXT_REDIRECT, so the
  // wide event finishes cleanly and we control the redirect below.
  await signIn('resend', { email, redirect: false })
  log.set({ result: 'magic-link-sent' })
})

export async function login(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = LoginSchema.safeParse({
    email: String(formData.get('email') ?? '').trim()
  })
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid email'
    }
  }

  try {
    await sendMagicLink(parsed.data.email)
  } catch (err) {
    console.error('login failed', err)
    return { ok: false, error: 'Could not send the magic link. Please try again.' }
  }

  // Outside the try/catch and the withEvlog wrapper: redirect throws
  // NEXT_REDIRECT, which must propagate (and stay out of error telemetry).
  redirect('/verify-request')
}
