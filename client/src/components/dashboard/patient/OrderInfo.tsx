import { useParams } from '@tanstack/react-router'
import { useUserData } from '@/hooks/useUserHook'
import { DeliveryMethod, formatCurrency, formatDate } from '@/types/api-types'
import { Truck, CheckCircle, Clock, Package, XCircle, MapPin, CreditCard, Info } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import React from 'react'
import DownloadInvoice from '@/components/modals/Download'

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

const statusSteps = [
  { id: 'pending', name: 'Order Placed' },
  { id: 'processing', name: 'Processing' },
  { id: 'shipped', name: 'Shipped' },
  { id: 'delivered', name: 'Delivered' },
]

const getStatusPercentage = (status: string) => {
  switch (status) {
    case 'pending': return 25
    case 'processing': return 50
    case 'shipped': return 75
    case 'delivered': return 100
    default: return 0
  }
}

export default function OrderInfo() {
  const { order } = useParams({ strict: false })
  const { orders } = useUserData()

  const orderFound = orders.find((o) => o.order_number === order)

  if (!orderFound) {
    return null // or handle loading state
  }

  const invoiceData = {
    invoiceNumber: orderFound.order_number,
    orderDate: formatDate(orderFound.order_date ?? ''),
    patientName: orderFound?.prescription?.patient?.first_name ?? 'Patient',
    doctorName: orderFound.prescription.doctor?.first_name ?? 'Telemed Doctor',
    service:  'Telemedicine Consultation',
    paymentMethod: orderFound.payment_method?.replace('_', ' ') || 'N/A',
    paymentStatus: orderFound.payment_status,
    deliveryMethod: orderFound.delivery_method?.replace('_', ' ') || 'N/A',
    deliveryAddress: orderFound.delivery_address || 'N/A',
    deliveryTime: orderFound.delivery_time || 'N/A',
    amountPaid: orderFound.amount,
    estimatedDelivery: formatDate(orderFound.estimated_delivery ?? ''),
    notes: 'Thank you for choosing our telemedicine services.',
  }
  

  if (!orderFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <Info className="w-10 h-10 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
            Order Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            We couldn't find order <span className="font-mono font-bold">{order}</span>.
            Please check the order number and try again.
          </p>
        </div>
      </div>
    )
  }

  const Icon = orderFound.delivery_status ? statusIcons[orderFound.delivery_status as keyof typeof statusIcons] : undefined
  const statusPercentage = getStatusPercentage(orderFound.delivery_status || 'pending')

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Order Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Order #{orderFound.order_number}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Placed on{' '}
                {orderFound.order_date
                  ? formatDate(orderFound.order_date)
                  : 'N/A'}
              </p>
            </div>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              {Icon && <Icon className="w-5 h-5 mr-2" />}
              <span className="capitalize font-medium">
                {orderFound.delivery_status}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Order Status
          </h2>

          <div className="relative mb-6">
            <Progress value={statusPercentage} className="h-2" />
            <div className="flex justify-between mt-4">
              {statusSteps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center 
                    ${
                      orderFound.delivery_status === step.id
                        ? 'bg-blue-600 text-white'
                        : statusSteps.findIndex(
                              (s) => s.id === orderFound.delivery_status,
                            ) > statusSteps.findIndex((s) => s.id === step.id)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {statusIcons[step.id as keyof typeof statusIcons] &&
                      React.createElement(
                        statusIcons[step.id as keyof typeof statusIcons],
                        { className: 'w-4 h-4' },
                      )}
                  </div>
                  <span
                    className={`text-xs mt-2 text-center ${orderFound.delivery_status === step.id ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {orderFound.estimated_delivery && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              Estimated delivery: {formatDate(orderFound.estimated_delivery)}
            </div>
          )}
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Delivery Information */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-500" />
              Delivery Information
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Method</p>
                <p className="capitalize font-medium text-gray-800 dark:text-gray-200">
                  {orderFound.delivery_method?.replace('_', ' ') || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Address</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {orderFound.delivery_address || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  Delivery Time
                </p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {orderFound.delivery_time || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-500" />
              Payment Information
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Method</p>
                <p className="capitalize font-medium text-gray-800 dark:text-gray-200">
                  {orderFound.payment_method?.replace('_', ' ') || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Status</p>
                <p className="capitalize font-medium text-gray-800 dark:text-gray-200">
                  {orderFound.payment_status || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Amount</p>
                <p className="font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(orderFound.amount || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        {/* {orderFound.prescription?.medication.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Prescription Items
            </h2>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {orderFound.prescription.medication.map((med: any) => (
                <div key={med.medication_id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{med.medication_name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {med.dosage} • {med.frequency} • {med.duration}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(med.price || 0)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Qty: {med.quantity || 1}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Order Summary
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <p className="text-gray-500 dark:text-gray-400">Subtotal</p>
              <p className="text-gray-800 dark:text-gray-200">
                {formatCurrency(orderFound.amount || 0)}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-500 dark:text-gray-400">Shipping</p>
              <p className="text-gray-800 dark:text-gray-200">
                {orderFound.delivery_method === DeliveryMethod.PICKUP
                  ? 'Free'
                  : 'Calculated at checkout'}
              </p>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="font-semibold text-gray-900 dark:text-white">
                Total
              </p>
              <p className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(orderFound.amount || 0)}
              </p>
            </div>
            {orderFound.payment_status === 'paid' && (
              <div className="mt-6 text-center">
                <DownloadInvoice invoiceData={invoiceData} />
              </div>
            )}
          </div>
        </div>

        {/* Support CTA */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help with your order?{' '}
            <a
              href="/support"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}