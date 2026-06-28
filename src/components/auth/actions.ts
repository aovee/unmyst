'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'

import { signIn, signOut } from '@/auth'
import { withEvlog, useLogger } from '@/lib/evlog'

export type ActionState = { ok: boolean; error: string | null }

/** Clears the session and returns the user to the login page. */
export async function logout() {
  await signOut({ redirectTo: '/login' })
}

const LoginSchema = z.object({
  email: z.email('Enter a valid email address')
})

/** Only allow same-site relative paths so `redirectTo` can't become an open redirect. */
function safeRedirect(target: string | null | undefined): string {
  if (target && target.startsWith('/') && !target.startsWith('//'))
    return target
  return '/'
}

const sendMagicLink = withEvlog(async (email: string, redirectTo: string) => {
  const log = useLogger()
  log.set({ action: 'login', email, redirectTo })
  // `redirectTo` becomes the callbackUrl baked into the magic link — it's where
  // Auth.js sends the user AFTER they click the link and the token is verified.
  // `redirect: false` only stops signIn from redirecting now (so we can send the
  // user to /verify-request below); it does not affect that callbackUrl.
  await signIn('resend', { email, redirectTo, redirect: false })
  log.set({ result: 'magic-link-sent' })
})

export async function login(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = LoginSchema.safeParse({
    email: String(formData.get('email') ?? '').trim()
  })
  console.log(parsed)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid email'
    }
  }

  // Where to land after the magic link is verified. Defaults to '/'; a hidden
  // <input name="redirectTo"> on the form (e.g. from ?callbackUrl=) can override it.
  const redirectTo = safeRedirect(formData.get('redirectTo')?.toString())

  try {
    await sendMagicLink(parsed.data.email, redirectTo)
  } catch (err) {
    console.error('login failed', err)
    return {
      ok: false,
      error: 'Could not send the magic link. Please try again.'
    }
  }

  // Outside the try/catch and the withEvlog wrapper: redirect throws
  // NEXT_REDIRECT, which must propagate (and stay out of error telemetry).
  redirect('/verify-request')
}
