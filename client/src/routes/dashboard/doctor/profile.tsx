
import { ProfileHandler } from '@/components/dashboard/doctor/ProfileHandler'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/doctor/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProfileHandler isAdminView={false} />
}
