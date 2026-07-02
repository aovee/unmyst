'use client'

import { useState } from 'react'

import { Subscription } from '@/db/schema'
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

interface EditSubscriptionDialogProps {
  subscription?: Subscription
  trigger: React.ReactNode
}

export function EditSubscriptionDialog({
  subscription,
  trigger
}: EditSubscriptionDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? 'Edit'}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogDescription>
            Edit infos about your subscription then click &quot;Save&quot;
          </DialogDescription>
        </DialogHeader>
        <SubscriptionForm
          subscription={subscription}
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
