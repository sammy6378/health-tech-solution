
import PrescriptionCreatePage from '@/components/modals/PrescriptionModal'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/dashboard/doctor/diagnoses/new-prescription/$dgs',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { dgs } = Route.useParams();
  return <PrescriptionCreatePage diagnosisId={dgs} />;
}
