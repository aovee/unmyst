import { withEvlog, useLogger, createError } from '@/lib/evlog'

/**
 * Example evlog-wrapped route handler.
 *
 * GET /api/health        → { status: 'ok' }
 * GET /api/health?fail=1 → structured 503 error (demonstrates createError)
 *
 * Either way, exactly one wide event is emitted when the request completes,
 * carrying every field accumulated via log.set().
 */
export const GET = withEvlog(async (request: Request) => {
  const log = useLogger()
  log.set({ action: 'health-check' })

  const url = new URL(request.url)
  if (url.searchParams.get('fail') === '1') {
    throw createError({
      status: 503,
      message: 'Health check failed',
      why: 'The ?fail=1 query flag was set',
      fix: 'Remove the fail flag to get a healthy response'
    })
  }

  log.set({ result: 'ok', uptime: process.uptime() })
  return Response.json({ status: 'ok' })
})
