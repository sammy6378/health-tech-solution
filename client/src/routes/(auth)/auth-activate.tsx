import { createFileRoute } from '@tanstack/react-router'
import ActivateEmail from '@/components/auth/activateEmail'

export const Route = createFileRoute('/(auth)/auth-activate')({
  component: ActivateEmail,
})
