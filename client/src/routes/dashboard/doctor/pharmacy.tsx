import Pharmacy from '@/components/dashboard/patient/Pharmacy'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/doctor/pharmacy')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Pharmacy />
}
