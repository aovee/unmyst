import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { users, verificationTokens } from '@nuxthub/db/schema'

const MAGIC_LINK_WINDOW_SECONDS = 10 * 60
const MAGIC_LINK_PER_EMAIL = 5
const MAGIC_LINK_PER_IP = 15
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000 // 24h, matching the email copy

const BodySchema = z.object({
  email: z.email('Enter a valid email address'),
  redirectTo: z.string().optional()
})

function safeRedirect(target: string | null | undefined): string {
  if (target && target.startsWith('/') && !target.startsWith('//')) return target
  return '/'
}

function clientIp(event: Parameters<typeof getRequestHeader>[0]): string {
  const forwarded = getRequestHeader(event, 'x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return getRequestHeader(event, 'x-real-ip')?.trim() || 'unknown'
}

export default defineEventHandler(async (event) => {
  const parsed = BodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Invalid email'
    })
  }

  const email = parsed.data.email.trim().toLowerCase()
  const redirectTo = safeRedirect(parsed.data.redirectTo)
  const ip = clientIp(event)

  // Throttle per-email and per-IP (unchanged logic from the old action).
  const [byEmail, byIp] = await Promise.all([
    checkRateLimit(
      `magic-link:email:${email}`,
      MAGIC_LINK_PER_EMAIL,
      MAGIC_LINK_WINDOW_SECONDS
    ),
    checkRateLimit(`magic-link:ip:${ip}`, MAGIC_LINK_PER_IP, MAGIC_LINK_WINDOW_SECONDS)
  ])
  if (!byEmail.ok || !byIp.ok) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please wait a few minutes and try again.'
    })
  }

  const config = useRuntimeConfig(event)
  const resendKey = config.resendKey || process.env.RESEND_KEY
  const from = config.emailFrom || process.env.RESEND_EMAIL_FROM

  // Mint a one-time token and persist it (identifier carries the redirect so the
  // verify handler can honour it without a second round-trip).
  const token = randomBytes(32).toString('hex')
  const origin = getRequestURL(event).origin
  const url = `${origin}/api/auth/verify?token=${token}&redirectTo=${encodeURIComponent(redirectTo)}`

  await db.insert(verificationTokens).values({
    identifier: email,
    token,
    expires: new Date(Date.now() + TOKEN_TTL_MS)
  })

  // Returning user vs brand-new address decides which branded email to send.
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  const host = new URL(url).host
  const { subject, html, text } = existing
    ? await signInEmail({ url, host })
    : await signUpEmail({ url, host })

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to: email, subject, html, text })
    })
    if (!res.ok) {
      throw new Error('Resend error: ' + JSON.stringify(await res.json()))
    }
  } catch (err) {
    console.error('magic link send failed', err)
    throw createError({
      statusCode: 502,
      statusMessage: 'Could not send the magic link. Please try again.'
    })
  }

  return { ok: true }
})
