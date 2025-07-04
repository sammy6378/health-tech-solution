import { useState } from 'react'
import {
  Calendar,
  Clock,
  Stethoscope,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Plus,
  ArrowUpDown,
  Filter,
  Search,
} from 'lucide-react'

// Types
type ConsultationType =
  | 'General Checkup'
  | 'Dermatology'
  | 'Cardiology'
  | 'Pediatrics'
  | 'Dental'
type AppointmentStatus = 'upcoming' | 'completed' | 'canceled'

interface Appointment {
  id: number
  doctor: string
  appointment_date: Date
  appointment_time: string
  duration_minutes: number
  consultation_type: ConsultationType
  status: AppointmentStatus
  notes: string
}

const AppointmentPage = () => {
  const [activeTab, setActiveTab] = useState<
    'upcoming' | 'completed' | 'canceled'
  >('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Appointment
    direction: 'ascending' | 'descending'
  } | null>(null)

  // Sample data
  const appointments: Appointment[] = [
    {
      id: 1,
      doctor: 'Dr. Smith',
      appointment_date: new Date('2023-06-15'),
      appointment_time: '10:00 AM',
      duration_minutes: 30,
      consultation_type: 'General Checkup',
      status: 'upcoming',
      notes: 'Annual physical examination',
    },
    {
      id: 2,
      doctor: 'Dr. Johnson',
      appointment_date: new Date('2023-06-20'),
      appointment_time: '2:30 PM',
      duration_minutes: 45,
      consultation_type: 'Dermatology',
      status: 'upcoming',
      notes: 'Skin allergy follow-up',
    },
    {
      id: 3,
      doctor: 'Dr. Williams',
      appointment_date: new Date('2023-05-28'),
      appointment_time: '9:15 AM',
      duration_minutes: 60,
      consultation_type: 'Cardiology',
      status: 'completed',
      notes: 'ECG and stress test results',
    },
    {
      id: 4,
      doctor: 'Dr. Brown',
      appointment_date: new Date('2023-05-15'),
      appointment_time: '11:00 AM',
      duration_minutes: 30,
      consultation_type: 'Pediatrics',
      status: 'canceled',
      notes: 'Rescheduled to June 20',
    },
    {
      id: 5,
      doctor: 'Dr. Davis',
      appointment_date: new Date('2023-04-10'),
      appointment_time: '3:45 PM',
      duration_minutes: 45,
      consultation_type: 'Dental',
      status: 'completed',
      notes: 'Regular cleaning and checkup',
    },
  ]

  // Filter appointments based on active tab and search query
  const filteredAppointments = appointments
    .filter((appt) => appt.status === activeTab)
    .filter(
      (appt) =>
        appt.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appt.consultation_type
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        appt.notes.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  // Sort appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (!sortConfig) return 0
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1
    }
    return 0
  })

  const requestSort = (key: keyof Appointment) => {
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
    upcoming: appointments.filter((a) => a.status === 'upcoming').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    canceled: appointments.filter((a) => a.status === 'canceled').length,
    total: appointments.length,
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <Calendar className="mr-2" />
            Appointments
          </h1>
          <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus size={18} className="mr-2" />
            New Appointment
          </button>
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
            className={`p-4 rounded-lg shadow cursor-pointer transition-colors ${activeTab === 'upcoming' ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-800'}`}
            onClick={() => setActiveTab('upcoming')}
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
            onClick={() => setActiveTab('completed')}
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
            className={`p-4 rounded-lg shadow cursor-pointer transition-colors ${activeTab === 'canceled' ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-800'}`}
            onClick={() => setActiveTab('canceled')}
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
                      Doctor
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
                    Notes
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedAppointments.length > 0 ? (
                  sortedAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <Stethoscope
                              size={18}
                              className="text-blue-600 dark:text-blue-300"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">
                              {appointment.doctor}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {formatDate(appointment.appointment_date)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {appointment.appointment_time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            appointment.consultation_type === 'General Checkup'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : appointment.consultation_type === 'Dermatology'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : appointment.consultation_type === 'Cardiology'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {appointment.consultation_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {appointment.duration_minutes} mins
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {appointment.notes}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                          View
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
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
