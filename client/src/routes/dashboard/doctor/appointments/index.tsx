import AppointmentPage from '@/components/dashboard/patient/Appointments'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/doctor/appointments/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AppointmentPage />
}
