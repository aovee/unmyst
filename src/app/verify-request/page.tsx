import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export default function VerifyRequestPage() {
  return (
    <main className="h-screen flex items-center">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader>
          <CardTitle>Success</CardTitle>
          <CardDescription>An email has been sent to you</CardDescription>
        </CardHeader>
        <CardContent>
          Please check your inbox and click the link to sign in
        </CardContent>
      </Card>
    </main>
  )
}
