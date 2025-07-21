import { Ourdoctors } from '@/components/dashboard/admin/ManageDoctors'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/doctor/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Ourdoctors />;
}
