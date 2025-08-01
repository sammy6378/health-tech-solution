import BillingPage from '@/components/dashboard/patient/Billing'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/billing')({
  component: RouteComponent,
})

function RouteComponent() {
  return <BillingPage />
}
