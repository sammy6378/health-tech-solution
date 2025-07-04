import * as React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { checkRole, Role } from '@/components/utils/roles-nav'

import { LayoutDashboard } from 'lucide-react'
import { navGroups } from '../utils/roles-nav'
import { Link } from '@tanstack/react-router'

// Dummy user for now
const currentUser = {
  name: 'shadcn',
  email: 'm@example.com',
  avatar: '/avatars/shadcn.jpg',
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole: Role
}

export function AppSidebar({ userRole, ...props }: AppSidebarProps) {
  // Get navigation groups based on user role
  const roleBasedNavGroups = checkRole(userRole)

  // Always include General navigation for all roles
  const generalGroup = navGroups.find((group) => group.label === 'General')
  const filteredNavGroups = generalGroup
    ? [...roleBasedNavGroups, generalGroup]
    : roleBasedNavGroups

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to={'/dashboard'}>
                <LayoutDashboard className="!size-5" />
                <span className="text-base font-semibold">HealthTech</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden hover:overflow-y-auto sidebar-scroll">
        {filteredNavGroups.map((group, idx) => (
          <SidebarMenu key={idx} className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
              {group.label}
            </div>
            {group.links.map((item, i) => (
              <SidebarMenuItem key={i}>
                <SidebarMenuButton asChild>
                  <Link to={item.url} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        ))}
      </SidebarContent>

      <SidebarFooter>
        {/* Optional: Show user role info */}
        <div className="px-4 py-2 text-xs text-muted-foreground">
          Role: {userRole}
        </div>
        {/* <NavUser user={currentUser} /> */}
      </SidebarFooter>
    </Sidebar>
  )
}
