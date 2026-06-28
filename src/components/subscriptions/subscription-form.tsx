'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { format } from 'date-fns'

import {
  createSubscription,
  updateSubscription,
  type ActionState
} from './actions'
import type { Subscription } from '@/db/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const initialState: ActionState = { ok: false, error: null }

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Add subscription'}
    </Button>
  )
}

interface SubscriptionFormProps {
  subscription?: Subscription
}

export function SubscriptionForm({ subscription }: SubscriptionFormProps) {
  const isEdit = Boolean(subscription)
  const action = isEdit ? updateSubscription : createSubscription
  const [state, formAction] = useActionState(action, initialState)

  return (
    <form action={formAction} className="space-y-4">
      {subscription && (
        <input type="hidden" name="id" defaultValue={subscription.id} />
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={subscription?.name}
          placeholder="Netflix"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Price (€)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          defaultValue={
            subscription ? (subscription.amount / 100).toFixed(2) : ''
          }
          placeholder="15.99"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cycle">Billing cycle</Label>
        <Select name="cycle" defaultValue={subscription?.cycle ?? 'monthly'}>
          <SelectTrigger id="cycle">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="intervalCount">Every N cycles</Label>
        <Input
          id="intervalCount"
          name="intervalCount"
          type="number"
          min="1"
          defaultValue={subscription?.intervalCount ?? 1}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="anchorDate">First billing date</Label>
        <Input
          id="anchorDate"
          name="anchorDate"
          type="date"
          defaultValue={
            subscription ? format(subscription.anchorDate, 'yyyy-MM-dd') : ''
          }
        />
      </div>

      <SubmitButton isEdit={isEdit} />
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.ok && !isEdit && <p className="text-sm text-green-600">Added!</p>}
    </form>
  )
}
