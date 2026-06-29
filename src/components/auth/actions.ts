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

  const email = parsed.data.email.toLowerCase()
  const ip = await clientIp()
  const [byEmail, byIp] = await Promise.all([
    checkRateLimit(
      `magic-link:email:${email}`,
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
    await sendMagicLink(parsed.data.email, redirectTo)
  } catch (err) {
    console.error('login failed', err)
    return {
      ok: false,
      error: 'Could not send the magic link. Please try again.'
    }
  }

  redirect('/verify-request')
}
