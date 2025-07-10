import { useState } from 'react'
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Filter,
  Search,
} from 'lucide-react'
import {
  AppointmentStatus,
  ConsultationType,
  formatDate,
  type TAppointment,
} from '@/types/api-types'
import { useUserData } from '@/hooks/useUserHook'
import { Link } from '@tanstack/react-router'

const AppointmentPage = () => {
  const [activeTab, setActiveTab] = useState<AppointmentStatus>(
    AppointmentStatus.SCHEDULED,
  )

  const { appointments,user } = useUserData();

  if (!appointments || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading appointments...</p>
      </div>
    )
  }



  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TAppointment
    direction: 'ascending' | 'descending'
  } | null>(null)

  // Filter appointments based on active tab and search query
  const filteredAppointments = appointments
    .filter((appt) => appt.status === activeTab)
    .filter(
      (appt) =>
        appt.doctor?.first_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        appt.consultation_type
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    )

  // Sort appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (!sortConfig) return 0
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    if (aValue === undefined) return 1
    if (bValue === undefined) return -1
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1
    }
    return 0
  })

  const requestSort = (key: keyof TAppointment) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  // Calculate metrics
  const metrics = {
    upcoming: appointments.filter(
      (a) => a.status === AppointmentStatus.SCHEDULED,
    ).length,
    completed: appointments.filter(
      (a) => a.status === AppointmentStatus.COMPLETED,
    ).length,
    canceled: appointments.filter(
      (a) => a.status === AppointmentStatus.CANCELLED,
    ).length,
    total: appointments.length,
  }

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <Calendar className="mr-2" />
            Appointments
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Appointments */}
          <div className="p-4 rounded-lg shadow bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total
                </p>
                <h3 className="text-2xl font-bold">{metrics.total}</h3>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                <Calendar size={24} />
              </div>
            </div>
          </div>

          {/* Upcoming */}
          <div
            className={`p-4 rounded-lg shadow cursor-pointer transition-colors ${activeTab === AppointmentStatus.SCHEDULED ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-800'}`}
            onClick={() => setActiveTab(AppointmentStatus.SCHEDULED)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upcoming
                </p>
                <h3 className="text-2xl font-bold">{metrics.upcoming}</h3>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                <Clock size={24} />
              </div>
            </div>
          </div>

          {/* Completed */}
          <div
            className={`p-4 rounded-lg shadow cursor-pointer transition-colors ${activeTab === 'completed' ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-800'}`}
            onClick={() => setActiveTab(AppointmentStatus.COMPLETED)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Completed
                </p>
                <h3 className="text-2xl font-bold">{metrics.completed}</h3>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>

          {/* Canceled */}
          <div
            className={`p-4 rounded-lg shadow cursor-pointer transition-colors ${activeTab === AppointmentStatus.CANCELLED ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-800'}`}
            onClick={() => setActiveTab(AppointmentStatus.CANCELLED)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Canceled
                </p>
                <h3 className="text-2xl font-bold">{metrics.canceled}</h3>
              </div>
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300">
                <XCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search appointments..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Filter size={16} className="mr-2" />
              Filters
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <ArrowUpDown size={16} className="mr-2" />
              Sort
            </button>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="rounded-lg shadow bg-white dark:bg-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('doctor')}
                  >
                    <div className="flex items-center">
                      {user?.role === 'doctor' ? 'Patient' : 'Doctor'}
                      <ArrowUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('appointment_date')}
                  >
                    <div className="flex items-center">
                      Date & Time
                      <ArrowUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('consultation_type')}
                  >
                    <div className="flex items-center">
                      Consultation Type
                      <ArrowUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('duration_minutes')}
                  >
                    <div className="flex items-center">
                      Duration
                      <ArrowUpDown size={14} className="ml-1" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Meeting Link
                  </th>
                  {user.role === 'doctor' && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedAppointments.length > 0 ? (
                  sortedAppointments.map((appointment) => (
                    <tr
                      key={appointment.appointment_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium">
                              {user?.role === 'doctor'
                                ? `${appointment.patient?.first_name} ${appointment.patient?.last_name}`
                                : `${appointment.doctor?.first_name} ${appointment.doctor?.last_name}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {formatDate(appointment.appointment_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            appointment.consultation_type ===
                            ConsultationType.IN_PERSON
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : appointment.consultation_type ===
                                  ConsultationType.VIRTUAL
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {appointment.consultation_type}
                        </span>
                      </td>
                      <td className='className="px-6 py-4 whitespace-nowrap text-sm"'>
                        {appointment.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {appointment.duration_minutes} mins
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {appointment.meeting_link ? (
                            <a
                              href={appointment.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Join Meeting
                            </a>
                          ) : (
                            'No link yet'
                          )}
                        </div>
                      </td>
                      {user.role === 'doctor' && (
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <Link
                         to='/dashboard/doctor/appointments/$appointment/add-diagnosis'
                          params={{ appointment: appointment.appointment_id ?? '' }}  
                         className="text-blue-600 cursor-pointer hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                           Add Diagnosis
                         </Link>
                       </td>
                      )}
                     
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No {activeTab} appointments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AppointmentPage
