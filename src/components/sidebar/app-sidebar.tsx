'use client'

import * as React from 'react'
import Link from 'next/link'
import { CreditCardIcon, House, type LucideIcon } from 'lucide-react'

import { Logo } from '@/components/logo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar'
import { NavUser, type NavUserProps } from './nav-user'
import { NavMain } from './nav-main'

export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
}

const navMain: NavItem[] = [
  { title: 'Dashboard', url: '/', icon: House },
  { title: 'Subscriptions', url: '/subscriptions', icon: CreditCardIcon }
]

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: NavUserProps['user']
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/">
              <Logo className="me-auto h-10 w-auto" />
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
