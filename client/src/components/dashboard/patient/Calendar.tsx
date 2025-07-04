import * as React from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Clock, MapPin, User, Phone, Mail, FileText, Star,Calendar1 } from 'lucide-react'

// Mock appointment data
const appointments = [
  {
    id: 1,
    date: new Date(2025, 5, 12),
    time: '10:00 AM',
    doctor: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    location: 'Medical Center, Room 205',
    type: 'Follow-up',
    status: 'confirmed',
    notes: 'Routine heart check-up. Please bring previous test results.',
    phone: '+1 (555) 123-4567',
    email: 'sarah.johnson@medcenter.com',
    rating: 4.9,
    duration: '30 minutes'
  },
  {
    id: 2,
    date: new Date(2025, 5, 15),
    time: '2:30 PM',
    doctor: 'Dr. Michael Chen',
    specialty: 'Dermatology',
    location: 'Skin Care Clinic, Floor 3',
    type: 'Consultation',
    status: 'pending',
    notes: 'Initial consultation for skin condition. Please avoid sun exposure 24 hours before appointment.',
    phone: '+1 (555) 234-5678',
    email: 'michael.chen@skinclinic.com',
    rating: 4.7,
    duration: '45 minutes'
  },
  {
    id: 3,
    date: new Date(2025, 5, 20),
    time: '11:15 AM',
    doctor: 'Dr. Emily Rodriguez',
    specialty: 'Orthopedics',
    location: 'Orthopedic Center, Room 102',
    type: 'Surgery Follow-up',
    status: 'confirmed',
    notes: 'Post-surgery check-up. X-rays will be taken during the visit.',
    phone: '+1 (555) 345-6789',
    email: 'emily.rodriguez@orthocenter.com',
    rating: 4.8,
    duration: '60 minutes'
  }
]

export function MyCalendar() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2025, 5, 12))

  // Get appointments for selected date
  const getAppointmentsForDate = (selectedDate) => {
    if (!selectedDate) return []
    return appointments.filter(apt => 
      apt.date.getDate() === selectedDate.getDate() &&
      apt.date.getMonth() === selectedDate.getMonth() &&
      apt.date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const getDatesWithAppointments = () => {
    return appointments.map(apt => apt.date)
  }

  const getStatusColor = (status:string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'cancelled':
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
                      <Sheet key={appointment.id}>
                        <SheetTrigger asChild>
                          <Card className="cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {appointment.doctor}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {appointment.specialty}
                                  </p>
                                </div>
                                <Badge
                                  className={getStatusColor(appointment.status)}
                                >
                                  {appointment.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Clock className="w-4 h-4" />
                                {appointment.time}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <MapPin className="w-4 h-4" />
                                {appointment.location}
                              </div>
                            </CardContent>
                          </Card>
                        </SheetTrigger>

                        <SheetContent className="w-full sm:max-w-md dark:bg-gray-800 dark:border-gray-700 px-6">
                          <SheetHeader>
                            <SheetTitle className="dark:text-white">
                              Appointment Details
                            </SheetTitle>
                            <SheetDescription className="dark:text-gray-400">
                              Complete information about your scheduled
                              appointment
                            </SheetDescription>
                          </SheetHeader>

                          <div className="mt-6 space-y-6">
                            {/* Doctor Info */}
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {appointment.doctor}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {appointment.specialty}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {appointment.rating}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <Separator className="dark:bg-gray-700" />

                            {/* Appointment Details */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <Calendar1 className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Date & Time
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {appointment.date.toLocaleDateString()} at{' '}
                                    {appointment.time}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Duration
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {appointment.duration}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Location
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {appointment.location}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Type
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {appointment.type}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <Separator className="dark:bg-gray-700" />

                            {/* Contact Info */}
                            <div className="space-y-3">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                Contact Information
                              </h4>
                              <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {appointment.phone}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {appointment.email}
                                </span>
                              </div>
                            </div>

                            <Separator className="dark:bg-gray-700" />

                            {/* Notes */}
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                Notes
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {appointment.notes}
                              </p>
                            </div>

                            {/* Status Badge */}
                            <div className="flex justify-center">
                              <Badge
                                className={`${getStatusColor(appointment.status)} px-3 py-1`}
                              >
                                {appointment.status.charAt(0).toUpperCase() +
                                  appointment.status.slice(1)}
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