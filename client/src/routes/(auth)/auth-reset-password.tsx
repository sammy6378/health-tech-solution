import ResetPassword from '@/components/auth/ResetPassword'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

export const Route = createFileRoute('/(auth)/auth-reset-password')({
  component: RouteComponent,
  validateSearch: z.object({
    token: z.string().min(1), // make sure token is present
  }),
})

function RouteComponent() {
  return <ResetPassword />
}
