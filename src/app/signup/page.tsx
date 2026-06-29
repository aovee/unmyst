import { SignupForm } from '@/components/auth/signup-form'

interface SignupPageProps {
  searchParams: Promise<{ callbackUrl?: string | string[] }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { callbackUrl } = await searchParams
  const redirectTo = Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm callbackUrl={redirectTo} />
      </div>
    </div>
  )
}
