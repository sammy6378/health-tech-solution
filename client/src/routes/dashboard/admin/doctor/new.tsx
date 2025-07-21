import { CreateDoctorForm } from '@/components/modals/NewDoctor'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/doctor/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreateDoctorForm />
}
