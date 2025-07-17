import Chat from '@/components/dashboard/patient/chat'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/doctor/chat')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Chat />
}
