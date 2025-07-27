import { useParams } from '@tanstack/react-router'
import { useAuthStore } from '@/store/store'
import { useGetDoctorProfileByUserId } from '@/hooks/useDoctorProfile'
import { CreateDoctorForm } from '@/components/modals/NewDoctor'
import DoctorProfile from '@/components/dashboard/doctor/DoctorProfile'

interface ProfileHandlerProps {
  isAdminView?: boolean
  doctorId?: string
}

export const ProfileHandler = ({
  isAdminView = false,
  doctorId,
}: ProfileHandlerProps) => {
  const { user } = useAuthStore()
  const params = useParams({ strict: false })

  // Determine which user ID to use
  const targetUserId =
    (isAdminView
      ? doctorId || params.doctorId
      : user?.userId) || ''

  const { doctorProfile, isLoading } = useGetDoctorProfileByUserId(targetUserId)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If no profile exists and we're in admin view, show create form
  if (!doctorProfile && isAdminView && targetUserId) {
    return <CreateDoctorForm />
  }

  // If no profile exists and we're in doctor view, show message
  if (!doctorProfile && !isAdminView) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
              Profile Not Set Up
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please contact the administrator to set up your doctor profile.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show the profile if it exists
  return <DoctorProfile />
}
