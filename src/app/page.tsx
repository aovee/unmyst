import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth, signOut } from '@/auth'
import Link from 'next/link'
import { db } from '@/db'
import { subscriptions } from '@/db/schema'
import { computeNextRenewal } from '@/lib/billing'
import { SubscriptionForm } from './subscription-form'
import { deleteSubscription } from './actions'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function Home() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const subs = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.user.id))

  const monthlyTotal = subs.reduce((sum, s) => {
    const perMonth =
      s.cycle === 'monthly'
        ? s.amount / s.intervalCount
        : s.cycle === 'yearly'
          ? s.amount / (12 * s.intervalCount)
          : (s.amount * 52) / 12 / s.intervalCount // weekly
    return sum + perMonth
  }, 0)

  return (
    <main className="p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My subscriptions</h1>
        <p className="text-muted-foreground">
          Monthly total: {(monthlyTotal / 100).toFixed(2)} €
        </p>
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}
        >
          <Button variant="outline" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionForm />
        </CardContent>
      </Card>

      <ul className="space-y-3">
        {subs.map((sub) => {
          const next = computeNextRenewal(
            sub.anchorDate,
            sub.cycle,
            sub.intervalCount
          )
          return (
            <li key={sub.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium">{sub.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(sub.amount / 100).toFixed(2)} {sub.currency} /{' '}
                      {sub.cycle} · next {next.toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline-primary" size="sm">
                      <Link href={`/subscriptions/${sub.id}/edit`}>Edit</Link>
                    </Button>
                    <form action={deleteSubscription.bind(null, sub.id)}>
                      <Button variant="destructive" size="sm" type="submit">
                        Delete
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
