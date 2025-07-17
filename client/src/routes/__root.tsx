import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'

import type { QueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { authSlice } from '@/store/store.ts'
import { Toaster } from 'sonner'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootRouteComponent,
})

function RootRouteComponent() {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize the auth state when the app loads
    const initialized = authSlice.initializeUser()
    setIsInitialized(true)

    // Optional: Log for debugging
    console.log('Auth initialized:', initialized)
  }, [])

  // Show loading until auth is initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <Outlet />
      <Toaster position="top-right" richColors />
      <TanStackQueryLayout />
    </>
  )
}