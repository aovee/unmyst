import { eq } from 'drizzle-orm'

export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['openid', 'email', 'profile']
  },
  async onSuccess(event, { user: googleUser }) {
    const email = String(googleUser.email).toLowerCase()

    // Upsert the app user by email (mirrors the magic-link create-on-first-login).
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) {
      ;[user] = await db
        .insert(users)
        .values({
          email,
          name: googleUser.name ?? null,
          image: googleUser.picture ?? null,
          emailVerified: new Date()
        })
        .returning()
    }

    await setUserSession(event, {
      user: {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        image: user!.image
      }
    })

    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('Google OAuth error', error)
    return sendRedirect(event, '/login?error=oauth')
  }
})
