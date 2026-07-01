import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'

import { ThemeProvider } from '@/components/theme-provider'
import { LocaleProvider } from '@/components/locale-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DEFAULT_LOCALE } from '@/lib/locale'
import './globals.css'

export const metadata: Metadata = {
  title: 'Unmyst',
  description: 'See clearly between your subscriptions'
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      className={`${GeistSans.className} h-full antialiased`}
      suppressHydrationWarning
    >
      <body>
        <LocaleProvider locale={DEFAULT_LOCALE}>
          <TooltipProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </TooltipProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
