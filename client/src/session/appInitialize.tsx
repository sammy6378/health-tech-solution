import { useEffect } from 'react'
import { authSlice } from '@/store/store'

export default function AppInitializer({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    authSlice.initializeUser()
  }, [])

  return <>{children}</>
}
