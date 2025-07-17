import OrderInfo from '@/components/dashboard/patient/OrderInfo'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/dashboard/pharmacy-dashboard/orders/$order',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <OrderInfo />
}
