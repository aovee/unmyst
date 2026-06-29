import { sql } from 'drizzle-orm'

import { db } from '@/db'
import { rateLimits } from '@/db/schema'

export type RateLimitResult = {
  /** Whether this request is within the allowed budget for the window. */
  ok: boolean
  /** Requests remaining in the current window (0 once blocked). */
  remaining: number
  /** When the current window resets and the budget refills. */
  resetAt: Date
}

/**
 * Fixed-window rate limiter backed by Postgres.
 *
 * Performs a single atomic upsert: it inserts a fresh window or, on conflict,
 * either resets the counter (if the previous window has elapsed) or increments
 * it. The decision happens server-side in one statement, so concurrent requests
 * racing on the same key cannot both slip through.
 *
 * @param key    Stable identifier for the thing being limited (endpoint + dimension).
 * @param limit  Max requests allowed per window.
 * @param windowSeconds Window length in seconds.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const windowInterval = sql.raw(`interval '${windowSeconds} seconds'`)

  const [row] = await db
    .insert(rateLimits)
    .values({
      key,
      count: 1,
      expiresAt: sql`now() + ${windowInterval}`
    })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${rateLimits.expiresAt} < now() then 1 else ${rateLimits.count} + 1 end`,
        expiresAt: sql`case when ${rateLimits.expiresAt} < now() then now() + ${windowInterval} else ${rateLimits.expiresAt} end`
      }
    })
    .returning({ count: rateLimits.count, expiresAt: rateLimits.expiresAt })

  const count = row?.count ?? 1
  const resetAt = row?.expiresAt ?? new Date(Date.now() + windowSeconds * 1000)

  return {
    ok: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt
  }
}
