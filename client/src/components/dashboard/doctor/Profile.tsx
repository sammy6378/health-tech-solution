import { useUserData } from '@/hooks/useUserHook'
import {
  Clock,
  MapPin,
  Phone,
  Star,
  Calendar,
  DollarSign,
  GraduationCap,
  Award,
  User,
  Stethoscope,
} from 'lucide-react'

const DoctorProfile = () => {
  const { profileData,doctors,user } = useUserData()

  const doctor = profileData?.doctorProfile;
  const doctorName = doctors.find((doc) => doc.user_id === user.userId);

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
              Doctor Profile Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              The requested doctor profile could not be loaded.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const averageRating =
    doctor.ratings && doctor.ratings.length > 0
      ? (
          doctor.ratings.reduce((a, b) => a + b, 0) / doctor.ratings.length
        ).toFixed(1)
      : 'N/A'

  type InfoCardProps = {
    icon: React.ElementType
    label: string
    value: string | number
    className?: string
  }

  const InfoCard = ({ icon: Icon, label, value, className = '' }: InfoCardProps) => (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </p>
          <p
            className={`text-sm font-semibold text-gray-900 dark:text-white truncate ${className}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  )

  const StatusBadge = ({ available }: {available: boolean}) => (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
        available
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full mr-2 ${
          available ? 'bg-green-500' : 'bg-red-500'
        }`}
      ></span>
      {available ? 'Available' : 'Unavailable'}
    </span>
  )

  const RatingDisplay = ({ rating }: {rating: string}) => (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
        <span className="text-sm font-semibold text-gray-900 dark:text-white ml-1">
          {rating}
        </span>
      </div>
      {rating !== 'N/A' && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({doctor.ratings?.length || 0} reviews)
        </span>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className=" px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Doctor Profile</h1>
              <StatusBadge available={doctor.availability} />
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={doctor.avatar}
                    alt="Doctor Avatar"
                    className="w-32 h-32 rounded-xl object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Dr. {doctorName?.first_name} {doctorName?.last_name}
                  </h2>
                  <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                    {doctor.specialization}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {doctor.department}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                  <RatingDisplay rating={averageRating} />
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Award className="w-4 h-4" />
                    <span>{doctor.years_of_experience} years experience</span>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {doctor.bio || 'No biography available.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard
            icon={Award}
            label="License Number"
            value={doctor.license_number}
          />
          <InfoCard
            icon={GraduationCap}
            label="Education"
            value={doctor.education}
          />
          <InfoCard icon={User} label="Gender" value={doctor.sex} />
          <InfoCard icon={MapPin} label="Address" value={doctor.address} />
          <InfoCard
            icon={Phone}
            label="Phone"
            value={doctor.phone_number || 'N/A'}
          />
          <InfoCard
            icon={DollarSign}
            label="Consultation Fee"
            value={
              doctor.consultation_fee ? `Ksh ${doctor.consultation_fee}` : 'N/A'
            }
          />
          <InfoCard
            icon={Calendar}
            label="Working Days"
            value={doctor.days?.join(', ') || 'Not specified'}
          />
          <InfoCard
            icon={Clock}
            label="Working Hours"
            value={
              doctor.start_time && doctor.end_time
                ? `${doctor.start_time} - ${doctor.end_time}`
                : 'Not specified'
            }
          />
        </div>

        {/* Reviews Section */}
        {doctor.reviews && doctor.reviews.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Patient Reviews
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {doctor.reviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          "{review}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorProfile
