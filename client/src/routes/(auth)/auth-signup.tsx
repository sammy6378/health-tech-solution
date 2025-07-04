import Signup from '@/components/auth/Signup'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/auth-signup')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Signup />
}
