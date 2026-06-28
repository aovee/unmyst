import { LoginForm } from '@/components/auth/login-form'

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string | string[] }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
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
