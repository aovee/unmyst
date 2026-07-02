'use client'

import { useActionState, useEffect, useRef, type ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import { format } from 'date-fns'
import { toast } from 'sonner'

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
import { CheckIcon, Loader2Icon } from 'lucide-react'

const initialState: ActionState = { ok: false, error: null }

export function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2Icon /> : <CheckIcon />}
      {pending ? 'Saving…' : 'Confirm'}
    </Button>
  )
}

interface SubscriptionFormProps {
  subscription?: Subscription
  /** Called after a successful create (e.g. to close a dialog). */
  onSuccess?: () => void
  /**
   * Rendered inside the <form>, replacing the default submit button.
   * Place a <SubmitButton /> here so useFormStatus() keeps working.
   */
  footer?: ReactNode
}

export function SubscriptionForm({
  subscription,
  onSuccess,
  footer
}: SubscriptionFormProps) {
  const isEdit = Boolean(subscription)
  const action = isEdit ? updateSubscription : createSubscription
  const [state, formAction] = useActionState(action, initialState)

  // Read onSuccess through a ref so an unstable inline callback from the parent
  // (e.g. `() => setOpen(false)`) isn't a reactive dependency below. Otherwise
  // calling onSuccess() re-renders the parent, which hands down a new onSuccess
  // reference and re-fires this effect while state.ok is still true — a double
  // toast.
  const onSuccessRef = useRef(onSuccess)
  useEffect(() => {
    onSuccessRef.current = onSuccess
  })

  // `state` is a fresh object per submission, so this runs once per result.
  useEffect(() => {
    if (!state.ok) return
    toast.success(isEdit ? 'Subscription updated' : 'Subscription created')
    onSuccessRef.current?.()
  }, [state, isEdit])

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

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.ok && !isEdit && !onSuccess && (
        <p className="text-sm text-green-600">Added!</p>
      )}

      {footer ?? <SubmitButton />}
    </form>
  )
}
