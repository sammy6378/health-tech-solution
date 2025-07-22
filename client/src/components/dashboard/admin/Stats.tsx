

import { useAdminData, useUserData } from '@/hooks/useDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Stethoscope,
  ClipboardCheck,
  PackageCheck,
  PackageSearch,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import dayjs from 'dayjs'

const StatCard = ({ title, value, icon: Icon }: any) => (
  <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="w-5 h-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
)

export default function AdminStatsPage() {
  const { stats, isLoading } = useUserData()
  const { doctors, patients } = useAdminData()

const getPatientRegistrationData = () => {
    const counts = Array(12).fill(0)
    patients.forEach((patient) => {
      if (patient.created_at) {
        const createdAtDate = new Date(patient.created_at)
        if (!isNaN(createdAtDate.getTime())) {
          const monthIndex = createdAtDate.getMonth() // 0-11
          counts[monthIndex] += 1
        }
      }
    })
    return counts
  }

  const getDoctorRegistrationData = () => {
    const counts = Array(12).fill(0)
    doctors.forEach((doctor) => {
      if (doctor.created_at) {
        const createdAtDate = new Date(doctor.created_at)
        if (!isNaN(createdAtDate.getTime())) {
          counts[createdAtDate.getMonth()] += 1
        }
      }
    })
    return counts
  }

   const chartData = Array.from({ length: 12 }, (_, i) => ({
     name: dayjs().month(i).format('MMM'),
    patients: getPatientRegistrationData()[i],
    doctors: getDoctorRegistrationData()[i],
  }))

  console.log('Chart Data:', chartData)


  return (
    <main className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-bold">📊 MediConnect Admin Dashboard</h1>
      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Appointments"
          value={stats.totalAppointments}
          icon={CalendarCheck}
        />
        <StatCard
          title="Upcoming Appointments"
          value={stats.upcomingAppointments}
          icon={CalendarClock}
        />
        <StatCard
          title="Completed Appointments"
          value={stats.completedAppointments}
          icon={CalendarX}
        />
        <StatCard
          title="Total Diagnoses"
          value={stats.totalDiagnoses}
          icon={Stethoscope}
        />
        <StatCard
          title="Total Prescriptions"
          value={stats.totalPrescriptions}
          icon={ClipboardCheck}
        />
        <StatCard
          title="Active Prescriptions"
          value={stats.activePrescriptions}
          icon={ClipboardCheck}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={PackageCheck}
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={PackageSearch}
        />
      </div>
      {/* chart and recent users */}
      {/* Line Chart */}
      <Card className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Monthly Activity</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
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
                  dataKey="patients"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ fill: '#4f46e5', r: 5 }}
                  name="Patients"
                />
                <Line
                  type="monotone"
                  dataKey="doctors"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                  name="doctors"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
