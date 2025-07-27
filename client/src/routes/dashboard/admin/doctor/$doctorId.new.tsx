
import { ProfileHandler } from '@/components/dashboard/doctor/ProfileHandler'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/doctor/$doctorId/new')({
  component: RouteComponent,
})

function RouteComponent() {
  const { doctorId } = Route.useParams()
  return <ProfileHandler isAdminView={true} doctorId={doctorId} />
}
