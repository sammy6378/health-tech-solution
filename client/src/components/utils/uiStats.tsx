import { useUserData } from '@/hooks/useUserHook'
import { DeliveryStatus, formatDate } from '@/types/api-types'
import { Link } from '@tanstack/react-router'
import {
  Calendar,
  ChevronRight,
  ClipboardList,
  Clock,
  MoreHorizontal,
  Pill,
  Plus,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const upcomingAppointments = () => {
  const { appointments } = useUserData()
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
  const { recentOrders } = useUserData()
  return (
    <div className="rounded-lg shadow bg-white dark:bg-gray-800 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <ClipboardList className="mr-2" size={20} />
          Recent Orders
        </h2>
        <Link
        to="/dashboard/orders" 
        className="text-sm flex items-center text-blue-600 dark:text-blue-400 cursor-pointer">
          View All <ChevronRight size={16} />
        </Link>
      </div>
      <div className="space-y-4">
        {recentOrders?.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8">
            No recent orders.
          </div>
        ) : (
          recentOrders?.map((order) => (
            <div
              key={order.order_id}
              className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700"
            >
              <div>
                <Link to='/dashboard/orders/$order' params={{ order: order.order_number ?? '' }} className="font-medium text-blue-400">{order.order_number}</Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {order.order_date ? formatDate(order.order_date) : 'No date'}
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
  const { activePrescriptions } = useUserData()
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
        {activePrescriptions?.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8">
            No active prescriptions.
          </div>
        ) : (
          activePrescriptions?.map((prescription) => (
            <div
              key={prescription.prescription_id}
              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {prescription.diagnosis?.diagnosis_name}
                  </p>
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


type BmiCategory = {
  label: string
  range: [number, number]
  color: string
  description: string
}

const bmiCategories: BmiCategory[] = [
  {
    label: 'Underweight',
    range: [0, 18.5],
    color: 'bg-blue-400',
    description:
      'Your BMI is considered below healthy. Consider a balanced diet.',
  },
  {
    label: 'Normal',
    range: [18.5, 24.9],
    color: 'bg-green-500',
    description: 'Your BMI is in the normal range. Keep up the good work!',
  },
  {
    label: 'Overweight',
    range: [25, 29.9],
    color: 'bg-yellow-400',
    description:
      'You are slightly above the normal BMI range. Watch your lifestyle.',
  },
  {
    label: 'Obese',
    range: [30, Infinity],
    color: 'bg-red-500',
    description: 'Your BMI is high. Consider medical and lifestyle support.',
  },
]

function getBmiCategory(bmi: number | null) {
  if (bmi === null) return null
  return bmiCategories.find((cat) => bmi >= cat.range[0] && bmi <= cat.range[1])
}

 function BmiTrackerCard({
  onAddClick,
}: {
  onAddClick: () => void
}) {
  const { bmiRecord } = useUserData()
  const bmi = bmiRecord?.BMI ?? null;

  const category = bmi !== null ? getBmiCategory(bmi) : null
  const barHeight = bmi !== null ? Math.min((bmi / 40) * 100, 100) : 0

  return (
    <div className="rounded-lg shadow bg-white dark:bg-gray-800 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold flex items-center text-gray-900 dark:text-white">
          <Activity className="mr-2" size={20} />
          BMI Tracker
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddClick}
          className="text-blue-600 dark:text-blue-400 cursor-pointer"
        >
          Update BMI
        </Button>
      </div>

      {/* BMI Chart */}
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-48 flex flex-col items-center justify-center">
        {bmi !== null ? (
          <>
            <div className="relative w-10 h-32 flex items-end justify-center mb-2">
              <div
                className={`w-6 rounded-t-md ${category?.color ?? 'bg-gray-300'}`}
                style={{ height: `${barHeight}%` }}
                title={`BMI: ${bmi}`}
              ></div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                BMI: <span className="font-bold">{bmi}</span> ({category?.label}
                )
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                {category?.description}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-300">
            No BMI record found.
          </p>
        )}
      </div>
    </div>
  )
}


export const UiStats = {
  upcomingAppointments,
  RecentOrders,
  ActivePrescriptions,
  BmiTrackerCard,
}
