import { createFileRoute, redirect } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import Tobbar from '@/components/dashboard/Tobbar'
import { AppSidebar } from '@/components/dashboard/Sidebar'
import { Outlet } from '@tanstack/react-router'
import { authStore, useAuthStore } from '@/store/store'
import type { Role } from '@/types/Tuser'
import ChatInterface from '@/components/modals/chatbot'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ location }) => {
    // Check both store state and localStorage
    const isAuthenticated = authStore.state.isAuthenticated
    const storedData = localStorage.getItem('auth')
    if (!isAuthenticated && !storedData) {
      throw redirect({
        to: '/auth-signin',
        search: {
          redirect: location.href,
        },
      })
    }

    // If store says not authenticated but localStorage has data, reinitialize
    if (!isAuthenticated && storedData) {
      try {
        const userData = JSON.parse(storedData)
        if (userData && userData.isAuthenticated) {
          authStore.setState({
            isAuthenticated: true,
            ...userData,
          })
        } else {
          throw redirect({
            to: '/auth-signin',
            search: {
              redirect: location.href,
            },
          })
        }
      } catch (error) {
        localStorage.removeItem('auth')
        throw redirect({
          to: '/auth-signin',
          search: {
            redirect: location.href,
          },
        })
      }
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const authState = useAuthStore()
  const role = authState.user?.role as Role
  return (
    <SidebarProvider
      className="bg-white dark:bg-gray-900"
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" userRole={role} />
      <SidebarInset>
        <Tobbar />
        <div className="flex flex-1 flex-col bg-white dark:bg-gray-900">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Outlet />
              <ChatInterface />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
