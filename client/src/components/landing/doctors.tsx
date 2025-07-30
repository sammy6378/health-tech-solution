import { useGetDoctors } from '@/hooks/useUserHook'

import { useState, useMemo } from 'react'
import {
  Search,
  Star,
  Clock,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  User,
  Stethoscope,
  GraduationCap,
  Award,
} from 'lucide-react'
import { Gender, type TDoctor } from '@/types/Tuser'
import Footer from './Footer'
import Navbar from './Navbar'
import { Link } from '@tanstack/react-router'

export const Ourdoctors = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedAvailability, setSelectedAvailability] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [selectedDoctor, setSelectedDoctor] = useState<TDoctor | null>(null)

  const { data: allDoctors } = useGetDoctors()
  const doctors = allDoctors?.data || []
  const profile = doctors.map((doc) => ({
    ...doc,
    ...(doc.doctorProfile || {}),
  user: { first_name: doc.first_name ?? '', last_name: doc.last_name ?? '' },
      license_number: doc.doctorProfile?.license_number ?? '',
      years_of_experience: doc.doctorProfile?.years_of_experience ?? 0,
      education: doc.doctorProfile?.education ?? '',
      specialization: doc.doctorProfile?.specialization ?? '',
      department: doc.doctorProfile?.department ?? '',
      availability: doc.doctorProfile?.availability ?? false,
      sex: doc.doctorProfile?.sex ?? Gender.MALE,
      address: doc.doctorProfile?.address ?? '', // Ensure address is always a string
      avatar: doc.doctorProfile?.avatar ?? '', // Ensure avatar is always a string
  }))

  const departments = [
    ...new Set(doctors.map((doc) => doc.doctorProfile?.department)),
  ]

  const filteredAndSortedDoctors = useMemo(() => {
    let filtered = profile.filter((doctor) => {
      const name = doctor.first_name + ' ' + doctor.last_name
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.doctorProfile?.specialization
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        doctor.doctorProfile?.department
          .toLowerCase()
          .includes(searchTerm.toLowerCase())

      const matchesDepartment =
        selectedDepartment === 'all' ||
        doctor.doctorProfile?.department === selectedDepartment
      const matchesAvailability =
        selectedAvailability === 'all' ||
        (selectedAvailability === 'available' &&
          doctor.doctorProfile?.availability) ||
        (selectedAvailability === 'unavailable' &&
          !doctor.doctorProfile?.availability)

      return matchesSearch && matchesDepartment && matchesAvailability
    })

    // Sort doctors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': {
          const nameA = a.first_name ?? ''
          const nameB = b.first_name ?? ''
          return nameA.localeCompare(nameB)
        }
        case 'experience':
          return (
            (b.doctorProfile?.years_of_experience ?? 0) -
            (a.doctorProfile?.years_of_experience ?? 0)
          )
        case 'rating': {
          const avgRatingA =
            a.doctorProfile?.ratings && a.doctorProfile?.ratings.length > 0
              ? a.doctorProfile?.ratings.reduce(
                  (sum, rating) => sum + rating,
                  0,
                ) / a.doctorProfile?.ratings.length
              : 0
          const avgRatingB =
            b.doctorProfile?.ratings && b.doctorProfile?.ratings.length > 0
              ? b.doctorProfile?.ratings.reduce(
                  (sum, rating) => sum + rating,
                  0,
                ) / b.doctorProfile?.ratings.length
              : 0
          return avgRatingB - avgRatingA
        }
        case 'fee':
          return (
            (a.doctorProfile?.consultation_fee ?? 0) -
            (b.doctorProfile?.consultation_fee ?? 0)
          )
        default:
          return 0
      }
    })

    return filtered
  }, [doctors, searchTerm, selectedDepartment, selectedAvailability, sortBy])

  const calculateAverageRating = (ratings: number[]) => {
    if (!ratings || ratings.length === 0) return 0
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
  }

  const DoctorCard = ({ doctor }: { doctor: TDoctor }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start space-x-4">
        <div className="relative">
          <img
            src={doctor.avatar}
            alt={doctor.user?.first_name}
            className="w-20 h-20 rounded-full object-cover"
          />
            {/* Online status dot based on current day availability */}
            {(() => {
              const dayMap: Record<number, string> = {
              0: 'Sunday',
              1: 'Monday',
              2: 'Tuesday',
              3: 'Wednesday',
              4: 'Thursday',
              5: 'Friday',
              6: 'Saturday',
              }
              const today = new Date().getDay()
              const todayName = dayMap[today]
              const isAvailableToday =
              doctor.days &&
              doctor.days.some(
                (d: string) =>
                d.toLowerCase() === todayName.toLowerCase() ||
                d.toLowerCase().slice(0, 3) === todayName.slice(0, 3).toLowerCase()
              )
              return (
              <span
                title={isAvailableToday ? 'Available today' : 'Not available today'}
                className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${
                isAvailableToday ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              )
            })()}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {doctor.user?.first_name} {doctor.user?.last_name}
            </h3>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {calculateAverageRating(doctor.ratings!).toFixed(1)}
              </span>
            </div>
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {doctor.specialization} • {doctor.department}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {doctor.years_of_experience} years experience
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {doctor.education}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400 truncate">
              {doctor.address}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              {doctor.phone_number}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              {doctor.start_time} - {doctor.end_time}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
            Consultation: ${doctor.consultation_fee}
            </span>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Available:
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {doctor.days?.map((day) => (
              <span
                key={day}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
              >
                {day}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => setSelectedDoctor(doctor)}
            className="flex-1 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
          >
            View Profile
          </button>
          <button
            className="flex-1 bg-green-600 cursor-pointer hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
            onClick={() => window.location.href = `/dashboard/doctors`}
            disabled={!doctor.availability}
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  )

  const DoctorModal = ({
    doctor,
    onClose,
  }: {
    doctor: TDoctor
    onClose: () => void
  }) => (
    <div className="fixed inset-0 bg-[#eeeeeea5] bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {doctor.user?.first_name} {doctor.user?.last_name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <img
              src={doctor.avatar}
              alt={`${doctor.user?.first_name} ${doctor.user?.last_name}`}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {doctor.specialization}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {doctor.department}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                License: {doctor.license_number}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                About
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{doctor.bio}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Education
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {doctor.education}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Reviews
              </h3>
              <div className="space-y-2">
                {doctor.reviews?.map((review, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 p-3 rounded"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      "{review}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
              disabled={!doctor.availability}
              to={'/dashboard/doctor'}
              search={{ doctorId: doctor.profile_id }}
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Our Doctors
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-8">
          Meet our team of experienced and dedicated healthcare professionals.
        </p>

        {/* Search and Filter Bar */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Doctors</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="name">Sort by Name</option>
              <option value="experience">Sort by Experience</option>
              <option value="rating">Sort by Rating</option>
              <option value="fee">Sort by Fee</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredAndSortedDoctors.length} of {doctors.length}{' '}
            doctors
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedDoctors.map((doctor) => (
            <DoctorCard
              key={doctor.doctorProfile?.profile_id}
              doctor={doctor}
            />
          ))}
        </div>

        {/* CTA to join as a doctor */}
        <div className="mt-16 flex justify-center">
          <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-xl px-10 py-10 max-w-xl w-full border border-blue-100 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-200 mb-3">
              Are you a doctor?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-base">
              Join our team of passionate professionals and help shape the future of healthcare.
            </p>
            <Link
              to="/auth-signup"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              <User className="w-5 h-5" />
              Join as a Doctor
            </Link>
          </div>
        </div>

        {/* No Results */}
        {filteredAndSortedDoctors.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No doctors found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Doctor Modal */}
        {selectedDoctor && (
          <DoctorModal
            doctor={selectedDoctor}
            onClose={() => setSelectedDoctor(null)}
          />
        )}
      </div>
      <Footer />
    </>
  )
}