import { useState } from 'react'
import {
  Package,
  Plus,
  Search,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  TrendingUp,
  ShoppingCart,
  Eye,
} from 'lucide-react'
import { useGetOrders } from '@/hooks/useOrders'
import {
  DeliveryStatus,
  type TOrder,
} from '@/types/api-types'

const statusColors = {
  pending:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  shipped:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  delivered:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const paymentStatusColors = {
  pending:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

function Orders() {
  const { data } = useGetOrders()
  const orders: TOrder[] = data?.data || []

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.prescription_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.delivery_address.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || order.delivery_status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status?: DeliveryStatus) => {
    if (!status) return null
    const Icon = statusIcons[status]
    return Icon ? <Icon className="w-4 h-4" /> : null
  }

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'KES 0.00'
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount)
  }

  const totalOrders = orders.length
  const activeOrders = orders.filter((order) =>
    [
      DeliveryStatus.PENDING,
      DeliveryStatus.PROCESSING,
      DeliveryStatus.SHIPPED,
    ].includes(order.delivery_status as DeliveryStatus),
  ).length
  const completedOrders = orders.filter(
    (order) => order.delivery_status === DeliveryStatus.DELIVERED,
  ).length
  const totalSpent = orders.reduce((sum, order) => sum + (order.amount || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your medicine orders and delivery status
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders */}
          <MetricCard
            label="Total Orders"
            value={totalOrders}
            icon={<ShoppingCart />}
            color="blue"
          />

          {/* Active Orders */}
          <MetricCard
            label="Active Orders"
            value={activeOrders}
            icon={<Clock />}
            color="yellow"
          />

          {/* Completed Orders */}
          <MetricCard
            label="Completed"
            value={completedOrders}
            icon={<CheckCircle />}
            color="green"
          />

          {/* Total Spent */}
          <MetricCard
            label="Total Spent"
            value={formatCurrency(totalSpent)}
            icon={<TrendingUp />}
            color="purple"
          />
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                {Object.values(DeliveryStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowNewOrderModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Order
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {/* Orders List */}
          {filteredOrders.length > 0 ? (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div
                  key={order.order_id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                      <div className="flex items-center gap-3 mb-2 lg:mb-0">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          {getStatusIcon(
                            order.delivery_status as DeliveryStatus,
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                            Order #{order.order_number || 'N/A'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Placed on{' '}
                            {order.order_date
                              ? formatDate(order.order_date)
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-medium px-3 py-1 rounded-full ${
                          statusColors[order.delivery_status || 'pending']
                        }`}
                      >
                        {order.delivery_status || 'pending'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {order.delivery_address}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {order.delivery_time}
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        {order.payment_method}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Total
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {order.amount ? formatCurrency(order.amount) : 'N/A'}
                        </p>
                      </div>
                      <button className="flex items-center cursor-pointer text-blue-600 hover:underline dark:text-blue-400">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-20">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div
          className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900 rounded-lg flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

export default Orders
