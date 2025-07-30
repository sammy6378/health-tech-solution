import * as React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { checkRole } from '@/components/utils/roles-nav'

import { LayoutDashboard } from 'lucide-react'
import { navGroups } from '../utils/roles-nav'
import { Link } from '@tanstack/react-router'
import { authSlice } from '@/store/store'
import { useRouterState } from '@tanstack/react-router'
import type { Role } from '@/types/Tuser'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole: Role
}

export function AppSidebar({ userRole, ...props }: AppSidebarProps) {
  // Get navigation groups based on user role
  const roleBasedNavGroups = checkRole(userRole)
  const { setOpenMobile } = useSidebar()

  // Always include General navigation for all roles
  const generalGroup = navGroups.find((group) => group.label === 'General')
  const filteredNavGroups = generalGroup
    ? [...roleBasedNavGroups, generalGroup]
    : roleBasedNavGroups

  const pathname = useRouterState({ select: (s) => s.location.pathname })

  // Function to handle navigation click and close sidebar on mobile
  const handleNavClick = () => {
    // Close sidebar on mobile devices
    setOpenMobile(false)
  }

  return (
    <Sidebar
      className="bg-white border border-r-gray-200 dark:border-r-0 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      collapsible="offcanvas"
      {...props}
    >
      <SidebarHeader className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to={'/dashboard'} onClick={handleNavClick}>
                <LayoutDashboard className="!size-5" />
                <span className="text-base font-semibold">MediConnect</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden hover:overflow-y-auto sidebar-scroll bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ">
        {filteredNavGroups.map((group, idx) => (
          <SidebarMenu key={idx} className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
              {group.label}
            </div>
            {group.links.map((item, i) => (
              <SidebarMenuItem key={i}>
                <SidebarMenuButton asChild>
                  <Link
                    to={item.to}
                    key={item.to}
                    onClick={handleNavClick}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200
    ${pathname === item.to ? 'bg-gray-200 dark:bg-gray-700 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        ))}
      </SidebarContent>

      <SidebarFooter className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <Link
          to="/auth-signin"
          onClick={() => {
            authSlice.logout()
            handleNavClick()
          }}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors duration-150"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
            />
          </svg>
          Logout
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}
