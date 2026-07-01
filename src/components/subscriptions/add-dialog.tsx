'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { SubscriptionForm, SubmitButton } from '@/components/subscriptions/form'
import { PlusIcon } from 'lucide-react'

export function AddSubscriptionDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon />
          Add Subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New Subscription</DialogTitle>
          <DialogDescription>
            Fill out infos about your newly subscribed service and click
            &quot;Save&quot;
          </DialogDescription>
        </DialogHeader>
        <SubscriptionForm
          onSuccess={() => setOpen(false)}
          footer={
            <DialogFooter className="flex lg:justify-between">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <SubmitButton />
            </DialogFooter>
          }
        />
      </DialogContent>
    </Dialog>
  )
}
