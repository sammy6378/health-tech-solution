import ProfilePage from '@/components/dashboard/patient/Profile'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProfilePage />
}
