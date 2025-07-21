import { Ourdoctors } from '@/components/landing/doctors'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/our-doctors')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Ourdoctors />
}
