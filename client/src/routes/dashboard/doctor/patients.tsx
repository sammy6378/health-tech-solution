import DoctorPatientsPage from '@/components/dashboard/doctor/Patients'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/doctor/patients')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DoctorPatientsPage />
}
