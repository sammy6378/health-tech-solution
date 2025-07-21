import Orders from '@/components/dashboard/patient/Orders'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/orders/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Orders />
}
