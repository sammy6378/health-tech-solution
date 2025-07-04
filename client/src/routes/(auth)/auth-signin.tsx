import Signin from '@/components/auth/Signin'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/auth-signin')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Signin />
}
