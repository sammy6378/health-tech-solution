import { useGetDoctors } from '@/hooks/useUserHook'

import { useState, useMemo } from 'react'
import {
  Search,
  User,
} from 'lucide-react'
import type { TDoctor } from '@/types/Tuser'
import { Link } from '@tanstack/react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

const PER_PAGE = 6

export const Ourdoctors = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedAvailability, setSelectedAvailability] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [selectedDoctor, setSelectedDoctor] = useState<TDoctor | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

 

  const { data: allDoctors } = useGetDoctors()
  const doctors = allDoctors?.data || []
  const profile = doctors.map((doc) => ({
    ...doc,
    ...(doc.doctorProfile || {}),
    user: { first_name: doc.first_name, last_name: doc.last_name },
    license_number: doc.doctorProfile?.license_number ?? '',
    years_of_experience: doc.doctorProfile?.years_of_experience ?? 0,
    education: doc.doctorProfile?.education ?? '',
    specialization: doc.doctorProfile?.specialization ?? '',
    department: doc.doctorProfile?.department ?? '',
    availability: doc.doctorProfile?.availability ?? false,
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

   const totalPages = Math.ceil(filteredAndSortedDoctors.length / PER_PAGE)
   const paginatedDoctors = useMemo(() => {
     const start = (currentPage - 1) * PER_PAGE
     return filteredAndSortedDoctors.slice(start, start + PER_PAGE)
   }, [filteredAndSortedDoctors, currentPage])


  const DoctorModal = ({
    doctor,
    onClose,
  }: {
    doctor: TDoctor
    onClose: () => void
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            MediConnect Doctors
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Meet our team of experienced and dedicated healthcare professionals.
          </p>
        </div>
        <Link
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors self-start md:self-auto"
          to="/dashboard/admin/doctor/new"
        >
          Add Doctor
        </Link>
      </div>

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
          Showing {filteredAndSortedDoctors.length} of {doctors.length} doctors
        </p>
      </div>

      {/* Doctors Grid */}
      {/* Doctors Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <Table className="min-w-full bg-white dark:bg-gray-800">
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Name</TableHead>
              <TableHead className="text-left">Department</TableHead>
              <TableHead className="text-left">Specialization</TableHead>
              <TableHead className="text-left">Experience</TableHead>
              <TableHead className="text-left">Fee</TableHead>
              <TableHead className="text-left">Availability</TableHead>
              <TableHead className="text-left">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDoctors.map((doctor) => (
              <TableRow key={doctor.doctorProfile?.profile_id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <img
                      src={doctor.avatar}
                      alt={doctor.first_name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {doctor.first_name} {doctor.last_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">
                  {doctor.department}
                </TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">
                  {doctor.specialization}
                </TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">
                  {doctor.years_of_experience} yrs
                </TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">
                  ${doctor.consultation_fee}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      doctor.availability
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {doctor.availability ? 'Available' : 'Unavailable'}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className={
                      currentPage === 1 ? 'opacity-50 pointer-events-none' : ''
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-3 text-sm text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    className={
                      currentPage === totalPages
                        ? 'opacity-50 pointer-events-none'
                        : ''
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
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
  )
}