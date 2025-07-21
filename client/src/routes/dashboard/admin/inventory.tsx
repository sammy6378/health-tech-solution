import Pharmacy from '@/components/dashboard/patient/Pharmacy'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/inventory')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Pharmacy />
}
