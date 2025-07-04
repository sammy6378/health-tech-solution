import { MyCalendar } from '@/components/dashboard/patient/Calendar'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/my-calendar')({
  component: RouteComponent,
})

function RouteComponent() {
  return <MyCalendar />
}
