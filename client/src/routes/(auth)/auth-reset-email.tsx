import ResetEmail from '@/components/auth/ResetEmail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/auth-reset-email')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ResetEmail />;
}
