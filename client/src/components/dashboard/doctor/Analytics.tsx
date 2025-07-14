import { useMemo } from 'react'
import { CalendarCheck2 } from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import dayjs from 'dayjs'
import { useUserData } from '@/hooks/useDashboard'


type ChartData = {
  name: string
  appointments: number
}

const processAppointments = (
  appointments: { date: string }[] = [],
): ChartData[] => {
  const monthlyCounts: Record<string, number> = {}

  appointments.forEach((app) => {
    const month = dayjs(app.date).format('MMM')
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1
  })

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return months.map((month) => ({
    name: month,
    appointments: monthlyCounts[month] || 0,
  }))
}

export default function AppointmentsAnalytics() {
  const { appointments } = useUserData()

  // Process the data directly in useMemo to avoid infinite loops
  const chartData = useMemo(() => {
    const formattedAppointments = appointments.map((a) => ({
      date:
        typeof a.appointment_date === 'string'
          ? a.appointment_date
          : new Date().toISOString(),
    }))

    return processAppointments(formattedAppointments)
  }, [appointments]) // Only depend on appointments, not the formatted version

  return (
    <div className="p-6 bg-white dark:bg-gray-900 shadow-lg rounded-xl">
      <div className="flex items-center gap-4 mb-4">
        <CalendarCheck2
          className="text-blue-600 dark:text-blue-400"
          size={28}
        />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Appointments Overview
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <XAxis
            dataKey="name"
            stroke="#9ca3af"
            tick={{ fill: 'currentColor' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              color: '#fff',
              borderRadius: 8,
              border: 'none',
            }}
            labelStyle={{ color: '#fff' }}
          />
          <CartesianGrid strokeDasharray="5 5" stroke="#374151" />
          <Line
            type="monotone"
            dataKey="appointments"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
