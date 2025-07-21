import ManageUsers from '@/components/dashboard/admin/ManageUsers'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/patients')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ManageUsers />;
}
