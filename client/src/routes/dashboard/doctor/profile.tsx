import DoctorProfile from '@/components/dashboard/doctor/Profile'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/doctor/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DoctorProfile />
}
