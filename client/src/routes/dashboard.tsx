import { createFileRoute } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import Tobbar from '@/components/dashboard/Tobbar'
import { AppSidebar } from '@/components/dashboard/Sidebar'
import { Outlet } from '@tanstack/react-router'
import { Role } from '@/components/utils/roles-nav'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" userRole={Role.PATIENT} />
      <SidebarInset>
        <Tobbar />
        <div className="flex flex-1 flex-col bg-gray-50 dark:bg-gray-900">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
