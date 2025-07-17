import {
    CalendarCheck,
    ClipboardList,
    Pill,
    TrendingUp,
  } from 'lucide-react'
  import { useUserData } from '@/hooks/useDashboard'
  import { Card } from '@/components/ui/card'
import { MyCalendar } from '../patient/Calendar'
import AppointmentsAnalytics from './Analytics'
import type { JSX } from 'react'
import { formatTime } from '@/types/api-types'
  
  function DoctorDashboard() {
    const {
      upcomingAppointments,
      completedAppointments,
      activePrescriptions,
      totalPrescriptions,
      profileData,
    } = useUserData()


  
    type ColorKey = keyof typeof COLORS;

    const metricCards: {
      label: string;
      value: number | undefined;
      icon: JSX.Element;
      color: ColorKey;
    }[] = [
      {
        label: 'Upcoming Appointments',
        value: upcomingAppointments?.length ?? 0,
        icon: <CalendarCheck className="h-5 w-5" />,
        color: 'blue',
      },
      {
        label: 'Completed Appointments',
        value: completedAppointments?.length,
        icon: <ClipboardList className="h-5 w-5" />,
        color: 'green',
      },
      {
        label: 'Active Prescriptions',
        value: activePrescriptions?.length,
        icon: <Pill className="h-5 w-5" />,
        color: 'yellow',
      },
      {
        label: 'Total Prescriptions',
        value: totalPrescriptions,
        icon: <TrendingUp className="h-5 w-5" />,
        color: 'indigo',
      },
    ]
  
    const COLORS = {
      blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
      green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
      yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300',
      red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300',
      indigo: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300',
    }
  
    return (
      <div className="min-h-screen p-4 md:p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome, Dr. {profileData?.first_name || 'Doctor'}
        </h1>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((metric, index) => (
            <Card
              key={index}
              className="p-4 flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300"
            >
              <div className={`p-3 rounded-full ${COLORS[metric.color]}`}>
                {metric.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metric.label}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* appointmnet card */}
        <Card className="p-6 max-w-xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
            Upcoming Appointments
          </h2>

          <ul className="space-y-4">
            {upcomingAppointments?.map((appointment) => (
              <li
                key={appointment.appointment_id}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {appointment.appointment_date} ·{' '}
                    {formatTime(appointment.start_time ?? '')}
                  </span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full capitalize">
                    {appointment.consultation_type}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Patient:
                  </span>{' '}
                  {appointment.patient?.first_name}{' '}
                  {appointment.patient?.last_name}
                </p>

                {appointment.meeting_link && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      Meeting Link:
                    </span>{' '}
                    <a
                      href={appointment.start_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {appointment.start_url}
                    </a>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Card>

        {/* Chart Card */}
        <Card className="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Appointment Stats
          </h2>
          <AppointmentsAnalytics />
        </Card>

        {/* Calendar Card */}
        <Card className="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
          <MyCalendar />
        </Card>
      </div>
    )
  }
  
  export default DoctorDashboard