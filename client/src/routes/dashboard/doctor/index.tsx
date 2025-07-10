import DoctorDashboard from '@/components/dashboard/doctor'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/doctor/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DoctorDashboard />
}
