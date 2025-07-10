import DiagnosesPage from '@/components/modals/Diagnoses'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/dashboard/doctor/appointments/$appointment/add-diagnosis',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <DiagnosesPage />
  )
}
