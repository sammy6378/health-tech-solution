import AdminStatsPage from '@/components/dashboard/admin/Stats'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminStatsPage />;
}
