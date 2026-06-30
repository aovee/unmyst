import Link from 'next/link'

import { Logo } from '@/components/logo'
import { FieldDescription, FieldGroup } from '@/components/ui/field'
import { ResendButton } from '@/components/auth/resend-button'

interface VerifyRequestPageProps {
  searchParams: Promise<{
    email?: string | string[]
    redirectTo?: string | string[]
  }>
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function VerifyRequestPage({
  searchParams
}: VerifyRequestPageProps) {
  const params = await searchParams
  const email = first(params.email)
  const redirectTo = first(params.redirectTo)

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
              <div className="mt-5 text-center">
                {email ? (
                  <ResendButton email={email} redirectTo={redirectTo} />
                ) : (
                  <FieldDescription>
                    Didn&apos;t get the mail?{' '}
                    <Link href="/login">Try again</Link>
                  </FieldDescription>
                )}
              </div>
            </div>
          </FieldGroup>
        </div>
      </div>
    </div>
  )
}
