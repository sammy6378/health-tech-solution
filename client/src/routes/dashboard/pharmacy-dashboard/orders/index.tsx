import Orders from '@/components/dashboard/patient/Orders'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/pharmacy-dashboard/orders/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Orders />
}
