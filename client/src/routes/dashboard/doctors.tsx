import DoctorsPage from '@/components/dashboard/patient/Doctors'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/doctors')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DoctorsPage />
}
