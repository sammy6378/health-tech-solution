import DiagnosesTable from '@/components/dashboard/doctor/Diagnoses'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/doctor/diagnoses/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DiagnosesTable />
}
