import PatientStatsPage from '@/components/dashboard/patient/Stats'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/home')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PatientStatsPage />
}
