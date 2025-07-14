import CheckoutPage from '@/components/modals/OrderModal'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/cart/new-order')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CheckoutPage />
}
