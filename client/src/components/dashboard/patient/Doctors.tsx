import { useGetDoctors} from '@/hooks/useUserHook'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Star } from 'lucide-react'
import { useState } from 'react'
import { AppointmentModal } from '@/components/modals/AppointmentModal'

export default function DoctorsPage() {
  const { data, isLoading } = useGetDoctors()
  const [search, setSearch] = useState('')
   const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const doctors = data?.data || []

  const filteredDoctors = doctors.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const specialization =
      user.doctorProfile?.specialization?.toLowerCase() || ''
    return (
      fullName.includes(search.toLowerCase()) ||
      specialization.includes(search.toLowerCase())
    )
  })


  const validateAvailability = (doctor: any) => {
    const days = doctor.days || []
    const today = new Date()
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase()
    const isAvailableToday = days
      .map((d: string) => d.toLowerCase())
      .includes(today)

    const now = new Date()
    const currentHours = now.getHours()
    const currentMinutes = now.getMinutes()

    const [startHour, startMinute] =
      doctor.start_time?.split(':').map(Number) || []
    const [endHour, endMinute] = doctor.end_time?.split(':').map(Number) || []

    const currentTotal = currentHours * 60 + currentMinutes
    const startTotal = startHour * 60 + startMinute
    const endTotal = endHour * 60 + endMinute

    const isWithinTimeRange =
      currentTotal >= startTotal && currentTotal <= endTotal

    return isAvailableToday && isWithinTimeRange
  }
  

  return (
    <div className="container py-12 px-4 min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Find a Doctor
        </h1>
        <Input
          placeholder="Search by name or specialization"
          className="w-full max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-64 w-full rounded-xl bg-white dark:bg-gray-800"
            />
          ))}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
          <p className="text-lg font-medium">No doctors found.</p>
          <p className="text-sm">Try adjusting your search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredDoctors.map((user, i) => {
            const doctor = user.doctorProfile
            if (!doctor) return null

            const avgRating = doctor.ratings?.length
              ? (
                  doctor.ratings.reduce((a, b) => a + b, 0) /
                  doctor.ratings.length
                ).toFixed(1)
              : null

            return (
              <Card
                key={doctor.profile_id || i}
                className="rounded-2xl p-0 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition bg-white dark:bg-gray-900"
              >
                {/* Large Image Section */}
                <div className="relative w-full">
                  <img
                    src={doctor.avatar}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-full h-56 object-cover object-top"
                    style={{ display: 'block' }}
                  />
                  {(!doctor.availability ||
                    (Array.isArray(doctor.days) &&
                      !doctor.days
                        .map((d: string) => d.toLowerCase())
                        .includes(
                          new Date()
                            .toLocaleDateString('en-US', { weekday: 'long' })
                            .toLowerCase(),
                        ))) && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      Unavailable
                    </div>
                  )}
                </div>

                <CardContent className="px-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Dr. {user.first_name} {user.last_name}
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {doctor.specialization}
                  </p>

                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>
                      <strong>Dept:</strong> {doctor.department}
                    </p>
                    <p>
                      <strong>Experience:</strong> {doctor.years_of_experience}{' '}
                      yrs
                    </p>
                    {avgRating && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{avgRating} ⭐</span>
                      </div>
                    )}
                  </div>

                  <div className="my-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      size="sm"
                    >
                      View Profile
                    </Button>
                    <Button
                      size="sm"
                      disabled={
                        !validateAvailability({
                          ...doctor,
                          days: doctor.days ?? [],
                          start_time: doctor.start_time ?? '08:00',
                          end_time: doctor.end_time ?? '17:00',
                        })
                      }
                      onClick={() => setSelectedDoctor(user)}
                      className="cursor-pointer"
                    >
                      Book Appointment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      {selectedDoctor && (
        <AppointmentModal
          open={!!selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          doctorId={selectedDoctor.user_id ?? ''}
          name={`${selectedDoctor.first_name} ${selectedDoctor.last_name}`}
          timeSlots={{
            start: selectedDoctor.doctorProfile?.start_time || '08:00',
            end: selectedDoctor.doctorProfile?.end_time || '17:00',
          }}
        />
      )}
    </div>
  )
}

