import CartPage from '@/components/dashboard/patient/cart/Cart'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/cart')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CartPage />
}
