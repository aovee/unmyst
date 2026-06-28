import * as React from 'react'

import { auth } from '@/auth'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

/**
 * Reusable authenticated app chrome: collapsible sidebar + top bar.
 * Pages render their own content as `children`; it's centered and width-capped
 * (not full-bleed) so reading lines stay comfortable on wide screens.
 */
export async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const user = {
    // Email-link sign-ups have no name set, so fall back to the email's local
    // part, then a generic label.
    name: session?.user?.name ?? session?.user?.email?.split('@')[0] ?? 'User',
    email: session?.user?.email ?? '',
    avatar: session?.user?.image ?? ''
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)'
        } as React.CSSProperties
      }
    >
      <AppSidebar user={user} />
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
