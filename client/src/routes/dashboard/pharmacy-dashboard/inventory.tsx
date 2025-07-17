import Pharmacy from '@/components/dashboard/patient/Pharmacy'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/pharmacy-dashboard/inventory')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return <Pharmacy />
}
