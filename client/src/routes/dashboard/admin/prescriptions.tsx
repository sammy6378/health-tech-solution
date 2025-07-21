import PharmacyPrescriptionsTable from '@/components/dashboard/admin/Prescriptions-ph'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/prescriptions')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PharmacyPrescriptionsTable />
}
