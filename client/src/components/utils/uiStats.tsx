import { useGetAppointments } from '@/hooks/useAppointments'
import { useGetOrderMetrics } from '@/hooks/useOrders'
import { useGetPrescriptionMetrics } from '@/hooks/usePrescriptions'
import { DeliveryStatus, formatDate } from '@/types/api-types'
import {
  Calendar,
  ChevronRight,
  ClipboardList,
  Clock,
  MoreHorizontal,
  Pill,
  Plus,
} from 'lucide-react'

const upcomingAppointments = () => {
  const { data } = useGetAppointments()
  const appointments = data?.data || []
  return (
    <div className="rounded-lg shadow bg-white dark:bg-gray-800 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className=" font-semibold flex items-center">
          <Clock className="mr-2" size={20} />
          Upcoming Appointments
        </h2>
        <button className="text-blue-600 dark:text-blue-400 cursor-pointer">
          <Plus size={20} />
        </button>
      </div>
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8">
            No upcoming appointments.
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.appointment_id}
              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {appointment.doctor?.first_name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {appointment.consultation_type}
                  </p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <MoreHorizontal size={16} />
                </button>
              </div>
              <div className="flex items-center mt-2 text-sm">
                <Calendar
                  size={14}
                  className="mr-1 text-gray-500 dark:text-gray-400"
                />
                <span className="text-gray-500 dark:text-gray-400 mr-3">
                  {formatDate(appointment.appointment_date)}
                </span>
                <Clock
                  size={14}
                  className="mr-1 text-gray-500 dark:text-gray-400"
                />
                <span className="text-gray-500 dark:text-gray-400">
                  {appointment.appointment_time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// orders
export const RecentOrders = () => {
  const { recentOrders } = useGetOrderMetrics()
  return (
    <div className="rounded-lg shadow bg-white dark:bg-gray-800 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <ClipboardList className="mr-2" size={20} />
          Recent Orders
        </h2>
        <button className="text-sm flex items-center text-blue-600 dark:text-blue-400 cursor-pointer">
          View All <ChevronRight size={16} />
        </button>
      </div>
      <div className="space-y-4">
        {recentOrders.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8">
            No recent orders.
          </div>
        ) : (
          recentOrders.map((order) => (
            <div
              key={order.order_id}
              className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700"
            >
              <div>
                {/* <p className="font-medium">{order}</p> */}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {order.order_date}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  order.delivery_status === DeliveryStatus.DELIVERED
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}
              >
                {order.delivery_status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// prescriptions
export const ActivePrescriptions = () => {
  const { active } = useGetPrescriptionMetrics()
  return (
    <div className="rounded-lg shadow bg-white dark:bg-gray-800 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold flex items-center">
          <Pill className="mr-2" size={20} />
          Active Prescriptions
        </h2>
        <button className="text-sm flex items-center cursor-pointer text-blue-600 dark:text-blue-400">
          View All <ChevronRight size={16} />
        </button>
      </div>
      <div className="space-y-4">
        {active.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8">
            No active prescriptions.
          </div>
        ) : (
          active.map((prescription) => (
            <div
              key={prescription.medication_id}
              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{prescription.medication_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {prescription.dosage_instructions.join(', ')}
                  </p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <MoreHorizontal size={16} />
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <p>{prescription.frequency_per_day}</p>
                {/* <p>Remaining: {prescription.remaining}</p> */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export const UiStats = {
  upcomingAppointments,
  RecentOrders,
  ActivePrescriptions,
}
