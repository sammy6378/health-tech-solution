import { usePharmacyData, useUserData } from '@/hooks/useUserHook'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pill,
  ShoppingCart,
  Users,
  AlertCircle,
  CalendarClock,
  PackageCheck,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  formatDate,
  type TMedication,
  type TPrescription,
} from '@/types/api-types'
import dayjs from 'dayjs'

export function PharmacyDashboard() {
  const { medications, stats, isLoading } = usePharmacyData()
  const { prescriptions } = useUserData()

  const chartData = Array.from({ length: 12 }, (_, i) => {
    const month = dayjs().month(i).format('MMM')
    return {
      name: month,
      prescriptions: stats?.monthlyPrescriptions?.[i] ?? 0,
      orders: stats?.monthlyOrders?.[i] ?? 0,
    }
  })

  console.log("chart data", chartData)

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Pharmacy Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Prescriptions */}
        <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium">
              Total Prescriptions
            </CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.totalPrescriptions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.prescriptionsChangePercent || 0}% from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.totalOrders || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.ordersChangePercent || 0}% from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Payments */}
        <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium">
              Total Payments
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.totalPayments || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.paymentsChangePercent || 0}% from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium">
              Inventory Status
            </CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.lowStockItems || 0} / {stats?.totalMedications || 0}
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Low stock items
                </p>
                <Progress
                  value={stats?.inventoryPercentage || 0}
                  className="h-2"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart and Recent Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
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
                    dataKey="prescriptions"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ fill: '#4f46e5', r: 5 }}
                    name="Prescriptions"
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 5 }}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Styled Recent Prescriptions */}
        <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Recent Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : prescriptions.length > 0 ? (
              <div className="space-y-4">
                {prescriptions
                  .slice(0, 4)
                  .map((prescription: TPrescription) => (
                    <div
                      key={prescription.prescription_id}
                      className="rounded-xl bg-muted p-4 dark:bg-gray-800 shadow-sm hover:shadow-md transition-all"
                    >
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {prescription.diagnosis?.patient?.first_name}{' '}
                        {prescription.diagnosis?.patient?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {prescription.medications
                          ?.map(
                            (med) =>
                              `${med.name} (Qty: ${med.dosage}) (Batch: ${med.medication_code})`,
                          )
                          .join(', ')}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent prescriptions
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expiring Soon & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expiring Soon */}
        <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              <span>Expiring Soon</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : medications.filter((m:TMedication) => m.expiration_date).length > 0 ? (
              medications
                .filter((m: TMedication) => m.expiration_date)
                .slice(0, 3)
                .map((med: TMedication) => (
                  <div key={med.medication_id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {med.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Batch: {med.medication_code} • Expires:{' '}
                        {formatDate(med.expiration_date)}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {med.stock_quantity} left
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No medications expiring soon
              </p>
            )}
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>Low Stock</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : medications.filter(
                (m:TMedication) => m.stock_quantity && m.stock_quantity < 20,
              ).length > 0 ? (
              medications
                .filter(
                  (m: TMedication) => m.stock_quantity && m.stock_quantity < 20,
                )
                .slice(0, 3)
                .map((med: TMedication) => (
                  <div key={med.medication_id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {med.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {med.category} • Qty: {med.stock_quantity}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {med.stock_quantity} left
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No low stock medications
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
