import PharmacyPrescriptionsTable from '@/components/dashboard/Pharmacy/Prescriptions-ph'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/dashboard/pharmacy-dashboard/patient-prescriptions',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <PharmacyPrescriptionsTable />
}
