import { eq, lt } from 'drizzle-orm'
import { users, verificationTokens } from '@nuxthub/db/schema'

function safeRedirect(target: string | null | undefined): string {
  if (target && target.startsWith('/') && !target.startsWith('//')) return target
  return '/'
}

export default defineEventHandler(async (event) => {
  const { token, redirectTo } = getQuery(event) as {
    token?: string
    redirectTo?: string
  }
  const dest = safeRedirect(redirectTo)

  if (!token) {
    return sendRedirect(event, '/login?error=missing-token')
  }

  // Look up the token; it must exist and not be expired.
  const [row] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token))
    .limit(1)

  if (!row || row.expires < new Date()) {
    // Clean up any stale rows for this token, then bounce back to login.
    if (row) {
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.token, token))
    }
    return sendRedirect(event, '/login?error=invalid-token')
  }

  const email = row.identifier

  // One-time use: consume the token (and opportunistically GC expired ones).
  await db.delete(verificationTokens).where(eq(verificationTokens.token, token))
  await db
    .delete(verificationTokens)
    .where(lt(verificationTokens.expires, new Date()))

  // Create the user on first verified link (replicates the adapter's behaviour),
  // otherwise reuse the existing row.
  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!user) {
    ;[user] = await db
      .insert(users)
      .values({ email, emailVerified: new Date() })
      .returning()
  } else if (!user.emailVerified) {
    await db
      .update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.id, user.id))
  }

  await setUserSession(event, {
    user: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      image: user!.image
    }
  })

  return sendRedirect(event, dest)
})
