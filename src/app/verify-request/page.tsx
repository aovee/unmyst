import Link from 'next/link'

import { Logo } from '@/components/logo'
import { FieldDescription, FieldGroup } from '@/components/ui/field'

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <FieldGroup>
            <div className="flex flex-col items-center gap-2">
              <Link href="/">
                <Logo />
              </Link>
              <div className="flex flex-col items-center gap-4 text-center">
                <h1 className="text-xl font-bold">Verify your email</h1>
                <FieldDescription>
                  An activation link has been sent to your email address. Please
                  check your inbox and click on the link to complete the
                  activation process.
                </FieldDescription>
              </div>
              <div className="mt-5">
                <FieldDescription>
                  Didn&apos;t get the mail? <a href="#">Resend</a>
                </FieldDescription>
              </div>
            </div>
          </FieldGroup>
        </div>
      </div>
    </div>
  )
}
