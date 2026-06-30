'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { signIn, signOut } from '@/auth'
import { withEvlog, useLogger } from '@/lib/evlog'
import { checkRateLimit } from '@/lib/rate-limit'

const MAGIC_LINK_WINDOW_SECONDS = 10 * 60
const MAGIC_LINK_PER_EMAIL = 5
const MAGIC_LINK_PER_IP = 15

async function clientIp(): Promise<string> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return h.get('x-real-ip')?.trim() || 'unknown'
}

export type ActionState = { ok: boolean; error: string | null }

export async function logout() {
  await signOut({ redirectTo: '/login' })
}

const LoginSchema = z.object({
  email: z.email('Enter a valid email address')
})

function safeRedirect(target: string | null | undefined): string {
  if (target && target.startsWith('/') && !target.startsWith('//'))
    return target
  return '/'
}

const sendMagicLink = withEvlog(async (email: string, redirectTo: string) => {
  const log = useLogger()
  log.set({ action: 'login', email, callbackUrl: redirectTo })
  await signIn('resend', { email, redirectTo, redirect: false })
  log.set({ result: 'magic-link-sent' })
})

// Shared by login and resend: throttle (per-email + per-IP) then send. Returns
// a status instead of redirecting so each caller can decide what to do next.
async function sendThrottledMagicLink(
  email: string,
  redirectTo: string
): Promise<ActionState> {
  const key = email.toLowerCase()
  const ip = await clientIp()
  const [byEmail, byIp] = await Promise.all([
    checkRateLimit(
      `magic-link:email:${key}`,
      MAGIC_LINK_PER_EMAIL,
      MAGIC_LINK_WINDOW_SECONDS
    ),
    checkRateLimit(
      `magic-link:ip:${ip}`,
      MAGIC_LINK_PER_IP,
      MAGIC_LINK_WINDOW_SECONDS
    )
  ])
  if (!byEmail.ok || !byIp.ok) {
    return {
      ok: false,
      error: 'Too many requests. Please wait a few minutes and try again.'
    }
  }

  try {
    await sendMagicLink(email, redirectTo)
  } catch (err) {
    console.error('magic link send failed', err)
    return {
      ok: false,
      error: 'Could not send the magic link. Please try again.'
    }
  }

  return { ok: true, error: null }
}

// Carry the email (and non-default callbackUrl) to /verify-request so the page
// can offer a working "Resend" without re-prompting for the address.
function verifyRequestPath(email: string, redirectTo: string): string {
  const params = new URLSearchParams({ email })
  if (redirectTo !== '/') params.set('redirectTo', redirectTo)
  return `/verify-request?${params.toString()}`
}

export async function loginWithEmail(
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

  const redirectTo = safeRedirect(formData.get('redirectTo')?.toString())
  const result = await sendThrottledMagicLink(parsed.data.email, redirectTo)
  if (!result.ok) return result

  redirect(verifyRequestPath(parsed.data.email, redirectTo))
}

// Resend from /verify-request: same throttle + send, but returns status inline
// (no redirect) so the button can show "sent" / rate-limit feedback in place.
export async function resendMagicLink(
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

  const redirectTo = safeRedirect(formData.get('redirectTo')?.toString())
  return sendThrottledMagicLink(parsed.data.email, redirectTo)
}
