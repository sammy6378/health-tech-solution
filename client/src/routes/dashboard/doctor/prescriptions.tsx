import PatientPrescriptionsPage from '@/components/dashboard/doctor/prescriptions'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/doctor/prescriptions')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PatientPrescriptionsPage />
}
