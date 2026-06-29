'use client'

import { Fragment } from 'react'
import { useTheme } from 'next-themes'
import {
  ChevronsUpDown,
  LogOut,
  Moon,
  Sparkles,
  Sun,
  type LucideIcon
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { logout } from '@/components/auth/actions'

export interface NavUserProps {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar()
  const { setTheme } = useTheme()

  const initials =
    (user.name || user.email || '?')
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'

  type MenuItem = {
    title: string
    leadingIcon?: LucideIcon
    trailingIcon?: LucideIcon
    onSelect?: () => void
    children?: MenuItem[]
  }

  const groups: MenuItem[][] = [
    [
      {
        title: 'Theme',
        leadingIcon: Sparkles,
        children: [
          {
            title: 'Light',
            leadingIcon: Sun,
            onSelect: () => setTheme('light')
          },
          {
            title: 'Dark',
            leadingIcon: Moon,
            onSelect: () => setTheme('dark')
          }
        ]
      }
    ],
    [{ title: 'Log out', leadingIcon: LogOut, onSelect: () => logout() }]
  ]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'top'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            {groups.map((group, index) => (
              <Fragment key={index}>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {group.map((item) => (
                    <Fragment key={item.title}>
                      {item.onSelect && (
                        <DropdownMenuItem onSelect={item.onSelect}>
                          {item.leadingIcon && <item.leadingIcon />}
                          {item.title}
                          {item.trailingIcon && (
                            <item.trailingIcon className="ms-auto" />
                          )}
                        </DropdownMenuItem>
                      )}

                      {item.children && item.children?.length > 0 && (
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            {item.title}
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              {item.children.map((child) => (
                                <DropdownMenuItem
                                  key={child.title}
                                  onSelect={child.onSelect}
                                >
                                  {child.leadingIcon && <child.leadingIcon />}
                                  {child.title}
                                  {child.trailingIcon && (
                                    <child.trailingIcon className="ms-auto" />
                                  )}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      )}
                    </Fragment>
                  ))}
                </DropdownMenuGroup>
              </Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
