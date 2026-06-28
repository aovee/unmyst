import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>
}) {
  const { callbackUrl } = await searchParams
  const redirectTo = Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm callbackUrl={redirectTo} />
      </div>
    </div>
  )
}
