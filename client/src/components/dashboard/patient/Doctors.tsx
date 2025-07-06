import { useGetDoctors, useGetUsers } from '@/hooks/useUserHook'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Star } from 'lucide-react'
import { useState } from 'react'

export default function DoctorsPage() {
  const { data, isLoading } = useGetDoctors()
  const [search, setSearch] = useState('')
  const doctors = data?.data || []

  // Optional search filtering
  const filteredDoctors = doctors.filter((user) => {
    const doctor = user.doctors?.[0]
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    return (
      fullName.includes(search.toLowerCase()) ||
      doctor?.specialization?.toLowerCase().includes(search.toLowerCase())
    )
  })

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
              className="h-48 w-full rounded-xl bg-white dark:bg-gray-800"
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
            const doctor = user.doctors![0]
            return (
              <Card
                key={i}
                className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition bg-white dark:bg-gray-900"
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Avatar className="w-20 h-20 mb-4">
                    <AvatarImage src={doctor.avatar} alt={user.first_name} />
                    <AvatarFallback>
                      {user.first_name[0]}
                      {user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Dr. {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {doctor.specialization}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {doctor.ratings?.length ? (
                      <>
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {(
                            doctor.ratings.reduce((a, b) => a + b, 0) /
                            doctor.ratings.length
                          ).toFixed(1)}{' '}
                          ⭐
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400 italic">
                        No ratings
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline">{doctor.department}</Badge>
                    <Badge
                      className={
                        doctor.availability ? 'bg-green-500' : 'bg-red-500'
                      }
                    >
                      {doctor.availability ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                    <Button size="sm" disabled={!doctor.availability}>
                      Book Appointment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
