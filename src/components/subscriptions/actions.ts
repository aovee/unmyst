'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { db } from '@/db'
import { subscriptions } from '@/db/schema'
import { auth } from '@/auth'

const SubscriptionSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  amount: z.number().int().positive('Price must be a positive number'), // cents
  currency: z.string().trim().min(1).default('EUR'),
  cycle: z.enum(['weekly', 'monthly', 'yearly']),
  intervalCount: z.number().int().min(1).default(1),
  anchorDate: z.date()
})

export type ActionState = { ok: boolean; error: string | null }

const parseForm = (formData: FormData) => {
  return SubscriptionSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    amount: Math.round(Number(formData.get('amount')) * 100), // euros → cents
    currency: String(formData.get('currency') ?? 'EUR'),
    cycle: String(formData.get('cycle') ?? ''),
    intervalCount: Number(formData.get('intervalCount') ?? 1),
    anchorDate: new Date(String(formData.get('anchorDate') ?? ''))
  })
}

export async function createSubscription(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: 'Not signed in' }

  const parsed = parseForm(formData)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input'
    }
  }
  try {
    await db
      .insert(subscriptions)
      .values({ ...parsed.data, userId: session.user.id })
  } catch (err) {
    console.error('createSubscription failed', err)
    return { ok: false, error: 'Could not save. Please try again.' }
  }
  revalidatePath('/')
  return { ok: true, error: null }
}

export async function updateSubscription(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: 'Not signed in' }

  const id = String(formData.get('id') ?? '')
  if (!id) return { ok: false, error: 'Missing subscription id' }

  const parsed = parseForm(formData)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input'
    }
  }
  try {
    await db
      .update(subscriptions)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(
        and(eq(subscriptions.id, id), eq(subscriptions.userId, session.user.id))
      )
  } catch (err) {
    console.error('updateSubscription failed', err)
    return { ok: false, error: 'Could not update. Please try again.' }
  }
  revalidatePath('/')
  redirect('/')
}

export async function deleteSubscription(id: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return

  await db
    .delete(subscriptions)
    .where(
      and(eq(subscriptions.id, id), eq(subscriptions.userId, session.user.id))
    )
  revalidatePath('/')
}
