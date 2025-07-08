import * as React from 'react'
import { Calendar } from '@/components/ui/calendar'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  Calendar1,
} from 'lucide-react'
import {  useGetAppointmentsByUser } from '@/hooks/useAppointments'
import { AppointmentStatus, formatDate } from '@/types/api-types'
import { InfoRow } from '@/components/utils/Labels'
import { useAuthStore } from '@/store/store'

export function MyCalendar() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2025, 5, 12),
  )

   const {user} = useAuthStore()
      const userId = user?.userId || '';

  const { data } = useGetAppointmentsByUser(userId)
  const appointments = data?.data || []

  // Get appointments for selected date
  const getAppointmentsForDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return []
    return appointments.filter((apt) => {
      const date = new Date(apt.appointment_date)
      return (
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()
      )
    })
  }

  const getDatesWithAppointments = () => {
    return appointments.map((apt) => new Date(apt.appointment_date))
  }
  

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case AppointmentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case AppointmentStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const selectedDateAppointments = getAppointmentsForDate(date)

  return (
    <div className={`min-h-screen transition-colors duration-300`}>
      <div className="min-h-screen">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Appointments
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and view your upcoming medical appointments
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Section */}
            <div className="lg:col-span-2">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Calendar1 className="w-5 h-5" />
                    Calendar View
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Select a date to view your appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    defaultMonth={date}
                    numberOfMonths={2}
                    selected={date}
                    onSelect={setDate}
                    className="rounded-lg border shadow-sm dark:border-gray-600"
                    modifiers={{
                      hasAppointment: getDatesWithAppointments(),
                    }}
                    modifiersStyles={{
                      hasAppointment: {
                        backgroundColor: '#3b82f6',
                        borderRadius: '50%',
                        color: 'white',
                        fontWeight: 'bold',
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Appointments for Selected Date */}
            <div>
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">
                    {date
                      ? date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Select a date'}
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    {selectedDateAppointments.length} appointment
                    {selectedDateAppointments.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedDateAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Calendar1 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No appointments scheduled for this date</p>
                    </div>
                  ) : (
                    selectedDateAppointments.map((appointment) => (
                      <Sheet key={appointment.appointment_id}>
                        <SheetTrigger asChild>
                          <Card className="cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {appointment.doctor?.first_name}{' '}
                                    {appointment.doctor?.last_name}
                                  </h3>
                                  {/* <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {appointment.specialty}
                                  </p> */}
                                </div>
                                <Badge
                                  className={getStatusColor(appointment.status ?? AppointmentStatus.PENDING)}
                                >
                                  {appointment.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Clock className="w-4 h-4" />
                                {appointment.appointment_time}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <MapPin className="w-4 h-4" />
                                {appointment.consultation_type}
                              </div>
                            </CardContent>
                          </Card>
                        </SheetTrigger>

                        <SheetContent className="w-full sm:max-w-md dark:bg-gray-800 dark:border-gray-700 px-6">
                          <div className="mt-6 space-y-6">
                            {/* Doctor Info */}
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {appointment.doctor?.first_name}{' '}
                                  {appointment.doctor?.last_name}
                                </h3>
                              </div>
                            </div>

                            <Separator className="dark:bg-gray-700" />

                            {/* Appointment Info */}
                            <div className="space-y-4">
                              <InfoRow
                                icon={
                                  <Calendar1 className="w-5 h-5 text-gray-400" />
                                }
                                label="Date & Time"
                              >
                                {formatDate(appointment.appointment_date)}{' '}
                                at {appointment.appointment_time}
                              </InfoRow>

                              <InfoRow
                                icon={
                                  <Clock className="w-5 h-5 text-gray-400" />
                                }
                                label="Duration"
                              >
                                {appointment.duration_minutes} minutes
                              </InfoRow>

                              {/* <InfoRow
                                icon={
                                  <MapPin className="w-5 h-5 text-gray-400" />
                                }
                                label="Location"
                              >
                                {appointment.location}
                              </InfoRow> */}

                              <InfoRow
                                icon={
                                  <FileText className="w-5 h-5 text-gray-400" />
                                }
                                label="Type"
                              >
                                {appointment.consultation_type}
                              </InfoRow>
                            </div>

                            <Separator className="dark:bg-gray-700" />

                            {/* Contact Info */}
                            <div className="space-y-3">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                Contact Info
                              </h4>
                              <InfoRow
                                icon={
                                  <Phone className="w-4 h-4 text-gray-400" />
                                }
                              >
                                {appointment.doctor?.first_name}
                              </InfoRow>
                              <InfoRow
                                icon={
                                  <Mail className="w-4 h-4 text-gray-400" />
                                }
                              >
                                {appointment.doctor?.email}
                              </InfoRow>
                            </div>

                            <Separator className="dark:bg-gray-700" />

                            {/* Notes */}
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                Notes
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {appointment.notes || 'No notes available.'}
                              </p>
                            </div>

                            {/* Status */}
                            <div className="flex justify-center">
                              <Badge
                                className={`${getStatusColor(appointment.status || AppointmentStatus.PENDING)} px-3 py-1 text-sm`}
                              >
                                {appointment.status}
                              </Badge>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
