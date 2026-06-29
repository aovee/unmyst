import NextAuth from 'next-auth'
import Resend from 'next-auth/providers/resend'
import Google from 'next-auth/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { users, accounts, sessions, verificationTokens } from '@/db/schema'
import { signInEmail, signUpEmail } from '@/lib/auth-email'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens
  }),
  providers: [
    Resend({
      from: process.env.EMAIL_FROM,
      // Brand the magic-link email and tailor its copy to intent. The adapter
      // only creates the user row *after* the link is verified, so at send time
      // an existing row means a returning user and its absence means a brand-new
      // signup. `identifier` is already lowercased/trimmed by Auth.js, matching
      // how user emails are stored.
      async sendVerificationRequest({ identifier: to, url, provider }) {
        const [existing] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, to))
          .limit(1)

        const host = new URL(url).host
        const { subject, html, text } = existing
          ? signInEmail({ url, host })
          : signUpEmail({ url, host })

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ from: provider.from, to, subject, html, text })
        })

        if (!res.ok) {
          throw new Error('Resend error: ' + JSON.stringify(await res.json()))
        }
      }
    }),
    Google
  ],
  pages: {
    verifyRequest: '/verify-request'
  }
})
