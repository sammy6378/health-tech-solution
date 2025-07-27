
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          403
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">
          You don't have permission to access this page
        </p>
        <div className="mt-6 space-x-4">
          <Button asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/auth-signin">Login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
