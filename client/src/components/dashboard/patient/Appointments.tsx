import { useState, useMemo } from 'react'
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
  formatCurrency,
  formatTime,
  PaymentStatus,
  type TAppointment,
} from '@/types/api-types'
import { useUserData } from '@/hooks/useDashboard'
import { Link } from '@tanstack/react-router'
import { useCancelAppointment, useCreateMeetingLink, useGetAppointmentsByUserRole, useUpdateAppointmentStatus } from '@/hooks/useAppointments'
import { useToast } from '@/hooks/use-toast'
import { useCreateAppointmentPayment, useGetPaymentsByAppointment, useVerifyAppointmentPayment } from '@/hooks/usePayments'
import { getErrorMessage } from '@/components/utils/handleError'
import PaystackModal from '@/components/modals/paystack'
import { useAuthStore } from '@/store/store'
import { useGetPatientProfileByUserId } from '@/hooks/usePatientProfile'

const AppointmentPage = () => {
  const [activeTab, setActiveTab] = useState<AppointmentStatus>(
    AppointmentStatus.SCHEDULED,
  )
  const [showPaystack, setShowPaystack] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TAppointment
    direction: 'ascending' | 'descending'
  } | null>(null)
  const { mutateAsync: createMeetingLink } = useCreateMeetingLink()
  const { toast } = useToast()

  const { user: currentUser } = useAuthStore()
  const userId = currentUser?.userId ?? ''
  const userRole = currentUser?.role as 'doctor' | 'patient'

  const { data: appointmentsData, isLoading } = useGetAppointmentsByUserRole(
    userId,
    userRole,
  )
  const appointments = appointmentsData?.data || []

  const { user } = useUserData()
  const { mutateAsync: updateStatus } = useUpdateAppointmentStatus()
  const { mutateAsync: createPayment } = useCreateAppointmentPayment()
  const { mutateAsync: verifyPayment } = useVerifyAppointmentPayment()
  const { mutateAsync: cancelAppointment } = useCancelAppointment()
  const { data } = useGetPatientProfileByUserId(userId)
  
  // For now, we'll handle payment queries differently to avoid the hooks rule violation
  // We'll query payments only when needed in the render loop
  const appointmentUserId =
    appointments.find((appt) => appt.patient?.user_id === userId)
      ?.appointment_id ?? ''
  const { data: userPayment } = useGetPaymentsByAppointment(appointmentUserId)

  const patient = data?.data

 

  // Helper function to check if an appointment is paid
  // This is a simplified approach - you may need to modify based on your data structure
  const isAppointmentPaid = (appointmentId: string) => {
    // For now, we'll use a simple check. You might need to implement a more sophisticated
    // solution depending on your requirements, such as:
    // 1. Fetching all payments at a higher level component
    // 2. Using a global state management solution
    // 3. Modifying your API to include payment status with appointments
    
    // Temporary solution: check if this is the user's appointment and if it's paid
    if (appointmentId === appointmentUserId && userPayment?.data) {
      return userPayment.data.some(payment => payment.payment_status === PaymentStatus.PAID)
    }
    
    // For other appointments, you might want to return false or implement different logic
    return false
  }

  // cancel appointment
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId)
      toast({
        title: 'Appointment canceled',
        description: 'The appointment has been successfully canceled.',
        variant: 'success',
      })
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
      toast({
        title: 'Failed to cancel appointment',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    }
  }

  // mark appointment as complete
  const handleMarkComplete = async (appointmentId: string) => {
    try {
      await updateStatus({
        id: appointmentId,
        status: AppointmentStatus.COMPLETED,
      })
      toast({
        title: 'Appointment marked as complete',
        description:
          'The appointment has been successfully marked as complete.',
        variant: 'success',
      })
    } catch (error) {
      console.error('Failed to mark appointment as complete:', error)
      toast({
        title: 'Failed to mark appointment as complete',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    }
  }

  // Filter appointments based on active tab and search query
  const filteredAppointments = appointments
    .filter((appt) => appt.status === activeTab)
    .filter(
      (appt) =>
        appt.doctor
          ?.first_name!.toLowerCase()
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

  // meeting links
  const createLink = async (appointmentId: string) => {
    try {
      await createMeetingLink(appointmentId)
      toast({
        title: 'Meeting link created',
        description: 'The meeting link has been successfully created.',
        variant: 'success',
      })
    } catch (error) {
      console.error('Failed to create meeting link:', error)
      toast({
        title: 'Failed to create meeting link',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    }
  }

  // initiate payment
  const initiatePayment = async (appointment: TAppointment) => {
    console.log('Initiating payment for appointment:', appointment)
    const name = `${patient?.patient?.first_name} ${patient?.patient?.last_name}`

    try {
      const res = await createPayment({
        amount: appointment.doctor?.doctorProfile?.consultation_fee,
        full_name: name,
        email: appointment.patient?.email ?? 'user@example.com',
        phone_number: patient?.phone_number ?? '0000000000',
        doctor_id: appointment.doctor?.user_id,
        user_id: patient?.user_id,
        appointment_id: appointment.appointment_id,
      })

      if (res.message === 'Payment already initiated') {
        toast({
          title: 'Payment already initialized',
          description: 'Redirecting…',
          variant: 'info',
        })
        return // Don't proceed if payment already initiated
      }

      const data = res.data
      console.log('Payment data received:', data)

      setPaymentData({
        email: data.email,
        amount: data.amount,
        reference: data.paystack_reference,
      })

      // Set show paystack to true AFTER setting payment data
      setShowPaystack(true)
    } catch (error) {
      console.error('Failed to initiate payment:', error)
      const message = getErrorMessage(error)
      toast({
        title: 'Payment initiation failed',
        description: message,
        variant: 'destructive',
      })
    }
  }

  // Handle payment success
  const handlePaymentSuccess = async (reference: string) => {
    try {
      setShowPaystack(false)
      await verifyPayment({ reference })
      setPaymentData(null) // Clear payment data
    } catch (error) {
      console.error('Payment verification failed:', error)
      toast({
        title: 'Payment verification failed',
        description: getErrorMessage(error),
        variant: 'destructive',
      })
    }
  }

  // Handle payment close
  const handlePaymentClose = () => {
    setShowPaystack(false)
    setPaymentData(null) // Clear payment data
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

  // check if doctor has consulation fee
  const consultationFees = (appointment: TAppointment) => {
    const fees = appointment.doctor?.doctorProfile?.consultation_fee ?? 0
    if (fees === undefined || fees === null) {
      return false
    }
    if (fees <= 0) {
      return false
    }
    return fees
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

        {showPaystack && paymentData && (
          <PaystackModal
            email={paymentData.email}
            amount={paymentData.amount}
            reference={paymentData.reference}
            onSuccess={handlePaymentSuccess}
            onClose={handlePaymentClose}
          />
        )}

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
                      {userRole === 'doctor' ? 'Patient' : 'Doctor'}
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
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Consultation Fee
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                  {userRole === 'doctor' && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Complete
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedAppointments.length > 0 ? (
                  sortedAppointments.map((appointment) => {
                    const isPaid = isAppointmentPaid(appointment.appointment_id ?? '')

                    return (
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
                            {appointment.appointment_date} :{' '}
                            {formatTime(appointment.start_time ?? '')}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {appointment.status}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {appointment.duration_minutes} mins
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {appointment.meeting_link && appointment.start_url ? (
                              <a
                                href={
                                  userRole === 'doctor'
                                    ? appointment.start_url
                                    : appointment.meeting_link
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Join
                              </a>
                            ) : userRole === 'doctor' ? (
                              <button
                                onClick={() =>
                                  createLink(appointment.appointment_id ?? '')
                                }
                                disabled={!isPaid}
                                className="text-blue-600 cursor-pointer hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Create Link
                              </button>
                            ) : (
                              'No Link'
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {consultationFees(appointment) ? (
                            appointment.status === AppointmentStatus.CANCELLED ? (
                              <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                Cancelled
                              </span>
                            ) : appointment.status ===
                              AppointmentStatus.COMPLETED ? (
                              <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                Completed
                              </span>
                            ) : isPaid ? (
                              <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Paid
                              </span>
                            ) : userRole === 'patient' ? (
                              <button
                                onClick={() => initiatePayment(appointment)}
                                className="p-2 cursor-pointer rounded-md shadow-lg text-white bg-green-400 hover:bg-green-500 transition-colors duration-300"
                              >
                                Checkout{' '}
                                {formatCurrency(
                                  consultationFees(appointment) as number,
                                ).replace(/\.00$/, '')}
                              </button>
                            ) : (
                              <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Unpaid
                              </span>
                            )
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">
                              Free/Paid
                            </span>
                          )}
                        </td>

                        {userRole === 'doctor' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                to="/dashboard/doctor/appointments/$appointment/add-diagnosis"
                                params={{
                                  appointment: appointment.appointment_id ?? '',
                                }}
                                className="text-blue-600 cursor-pointer hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                              >
                                Add Diagnosis
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                className="inline-flex cursor-pointer items-center px-3 py-1 rounded-md bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() =>
                                  handleMarkComplete(
                                    appointment.appointment_id ?? '',
                                  )
                                }
                                disabled={
                                  appointment.status ===
                                  AppointmentStatus.COMPLETED
                                }
                                title="Mark as Complete"
                              >
                                <CheckCircle2 size={16} className="mr-1" />
                                Mark Complete
                              </button>
                            </td>
                          </>
                        )}

                        {userRole === 'patient' && (
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              className="inline-flex cursor-pointer items-center px-3 py-1 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() =>
                                handleCancelAppointment(
                                  appointment.appointment_id ?? '',
                                )
                              }
                              disabled={
                                appointment.status ===
                                  AppointmentStatus.CANCELLED ||
                                appointment.status === AppointmentStatus.COMPLETED
                              }
                              title="Cancel Appointment"
                            >
                              <XCircle size={16} className="mr-1" />
                              Cancel
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
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