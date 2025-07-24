import { useUserData } from '@/hooks/useDashboard'
import { DeliveryStatus, formatDate, formatTime } from '@/types/api-types'
import { Link } from '@tanstack/react-router'
import {
  Calendar,
  ChevronRight,
  ClipboardList,
  Clock,
  MoreHorizontal,
  Pill,
  Plus,
  Activity, TrendingUp, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'


const orderStatusColors = {
  [DeliveryStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [DeliveryStatus.DELIVERED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [DeliveryStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  [DeliveryStatus.SHIPPED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [DeliveryStatus.PROCESSING]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

const upcomingAppointments = () => {
  const { appointments } = useUserData()
  // fileter past appointments
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.appointment_date)
    const today = new Date()
    return appointmentDate >= today && appointment.status === 'scheduled'
  })
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
        {filteredAppointments.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8">
            No upcoming appointments.
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment.appointment_id}
              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    Dr. {appointment.doctor?.first_name}{' '}
                    {appointment.doctor?.last_name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {appointment.consultation_type} meeting.
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
                  {appointment.appointment_date}{' '}
                  {formatTime(appointment.start_time ?? '')}
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
                className={`px-2 py-1 text-xs rounded-full ${orderStatusColors[order.delivery_status ?? DeliveryStatus.PENDING] ?? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
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
              {prescription.prescriptionMedications?.map((med) => (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {prescription.diagnosis?.diagnosis_name}
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {med.dosage_instructions.join(
                          ', ',
                        )}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <p>{med.frequency_per_day}</p>
                    {/* <p>Remaining: {prescription.remaining}</p> */}
                  </div>
                </>
              ))}
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
  bgColor: string
  description: string
}

const bmiCategories: BmiCategory[] = [
  {
    label: 'Underweight',
    range: [0, 18.5],
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    description:
      'Your BMI is considered below healthy. Consider a balanced diet.',
  },
  {
    label: 'Normal',
    range: [18.5, 24.9],
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    description: 'Your BMI is in the normal range. Keep up the good work!',
  },
  {
    label: 'Overweight',
    range: [25, 29.9],
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500',
    description:
      'You are slightly above the normal BMI range. Watch your lifestyle.',
  },
  {
    label: 'Obese',
    range: [30, Infinity],
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    description: 'Your BMI is high. Consider medical and lifestyle support.',
  },
]

function getBmiCategory(bmi: number | null) {
  if (bmi === null) return null
  return bmiCategories.find((cat) => bmi >= cat.range[0] && bmi < cat.range[1])
}

function BmiTrackerCard({ onAddClick }: { onAddClick: () => void }) {
  // Mock data - replace with your useUserData hook
  const bmiRecord = { bmi: 23.5 } // Example BMI value
  const bmi = bmiRecord?.bmi ?? null

  const category = bmi !== null ? getBmiCategory(bmi) : null

  // Calculate position for the user indicator (0-100%)
  const getUserPosition = (bmi: number) => {
    const maxBmi = 40 // Max BMI for visualization
    return Math.min((bmi / maxBmi) * 100, 100)
  }

  return (
    <div className="rounded-xl shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3">
            <Activity className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            BMI Tracker
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddClick}
          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
        >
          <TrendingUp className="mr-2" size={16} />
          Update BMI
        </Button>
      </div>

      {bmi !== null ? (
        <>
          {/* Current BMI Display */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg mb-2">
              <span className="text-2xl font-bold">{bmi.toFixed(1)}</span>
            </div>
            <p className={`text-lg font-semibold ${category?.color} mb-1`}>
              {category?.label}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
              {category?.description}
            </p>
          </div>

          {/* BMI Categories Chart */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <Info className="mr-2" size={16} />
              BMI Categories
            </h3>

            <div className="relative">
              {/* Background bar with all categories */}
              <div className="flex h-8 rounded-lg overflow-hidden shadow-inner">
                {bmiCategories.slice(0, 3).map((cat, index) => (
                  <div
                    key={cat.label}
                    className={`${cat.bgColor} opacity-60`}
                    style={{
                      width: index === 0 ? '25%' : index === 1 ? '35%' : '40%',
                    }}
                  />
                ))}
              </div>

              {/* User BMI Indicator */}
              {bmi && (
                <div
                  className="absolute top-0 w-1 h-8 bg-white border-2 border-gray-800 dark:border-white rounded-full shadow-lg transform -translate-x-1/2"
                  style={{ left: `${getUserPosition(bmi)}%` }}
                >
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gray-800 dark:bg-white text-white dark:text-gray-800 text-xs px-2 py-1 rounded whitespace-nowrap">
                      You: {bmi.toFixed(1)}
                    </div>
                    <div className="w-2 h-2 bg-gray-800 dark:bg-white transform rotate-45 mx-auto -mt-1"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Category Labels */}
            <div className="flex justify-between text-xs">
              <div className="text-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
                <span className="text-gray-600 dark:text-gray-400">Under</span>
                <br />
                <span className="text-gray-500">&lt;18.5</span>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                <span className="text-gray-600 dark:text-gray-400">Normal</span>
                <br />
                <span className="text-gray-500">18.5-24.9</span>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                <span className="text-gray-600 dark:text-gray-400">Over</span>
                <br />
                <span className="text-gray-500">25-29.9</span>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
                <span className="text-gray-600 dark:text-gray-400">Obese</span>
                <br />
                <span className="text-gray-500">30+</span>
              </div>
            </div>
          </div>

          {/* Health Tip */}
          {/* <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Health Tip:</span> BMI is a useful
              screening tool, but it doesn't account for muscle mass, bone
              density, or fat distribution. Consult with healthcare
              professionals for personalized advice.
            </p>
          </div> */}
        </>
      ) : (
        /* No BMI Data State */
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No BMI Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Track your Body Mass Index to monitor your health journey
          </p>
          <Button
            onClick={onAddClick}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            <TrendingUp className="mr-2" size={16} />
            Add Your First BMI Record
          </Button>
        </div>
      )}
    </div>
  )
}


export const UiStats = {
  upcomingAppointments,
  RecentOrders,
  ActivePrescriptions,
  BmiTrackerCard,
}
