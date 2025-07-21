import { PharmacyDashboard } from '@/components/dashboard/Pharmacy/Stats'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin/pharmacy')({
  component: PharmacyDashboard,
})

