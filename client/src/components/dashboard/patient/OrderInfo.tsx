import { useParams } from '@tanstack/react-router'
import { useUserData } from '@/hooks/useDashboard'
import { DeliveryMethod, DeliveryStatus, formatCurrency, formatDate, PaymentStatus, type TOrderMedication } from '@/types/api-types'
import {
  Truck,
  CheckCircle,
  Clock,
  Package,
  XCircle,
  MapPin,
  CreditCard,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import React, { useEffect, useState } from 'react'
import DownloadInvoice from '@/components/modals/Download'
import { useCreatePayment, useVerifyPayment } from '@/hooks/usePayments'
import { toast } from 'sonner'
import { getErrorMessage } from '@/components/utils/handleError'
import { useGetOrder, useUpdateOrderStatus } from '@/hooks/useOrders'
import { useAuthStore } from '@/store/store'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import PaystackModal from '@/components/modals/paystack'

// Extend the Window interface to include PaystackPop
declare global {
  interface Window {
    PaystackPop?: any
  }
}

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

const statusSteps = [
  { id: 'pending', name: 'Order Placed' },
  { id: 'cancelled', name: 'Cancelled' },
  { id: 'processing', name: 'Processing' },
  { id: 'shipped', name: 'Shipped' },
  { id: 'delivered', name: 'Delivered' },
]

const statusOptions = [
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const getStatusPercentage = (status: string) => {
  switch (status) {
     case 'cancelled':
      return 0
    case 'pending':
      return 25
    case 'processing':
      return 50
    case 'shipped':
      return 75
    case 'delivered':
      return 100
    default:
      return 0
  }
}

export default function OrderInfo() {
  const { order } = useParams({ strict: false })
  const [showPaystack, setShowPaystack] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const { mutateAsync: addPayment } = useCreatePayment()
  const { orders } = useUserData()
  const { mutateAsync: verifyPayment, isPending: verifying } =
  useVerifyPayment()
  const { mutateAsync: updateOrderStatus } = useUpdateOrderStatus()
  const {user} = useAuthStore()
  const role = user?.role || 'guest';
  const orderFound = orders.find((o) => o.order_number === order)
  const { data: profile } = useGetOrder(orderFound?.order_id!)
  const patient = profile?.data.patient;
  console.log('Order Found:', orderFound)
  console.log('Patient Found:', patient)

    useEffect(() => {
      if (!document.getElementById('paystack-script')) {
        const script = document.createElement('script')
        script.src = 'https://js.paystack.co/v1/inline.js'
        script.async = true
        script.id = 'paystack-script'
        document.body.appendChild(script)
      }
    }, [])


    if (!orderFound) {
      return (
        <div className="min-h-screen py-8 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Order Not Found
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  The order you're looking for doesn't exist or has been
                  removed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

  const invoiceData = {
    invoiceNumber: orderFound.order_number,
    orderDate: formatDate(orderFound.order_date ?? ''),
    patientName: orderFound?.prescription?.patient?.first_name ?? 'Patient',
    service: 'Telemedicine Consultation',
    paymentMethod: orderFound.payment_method?.replace('_', ' ') || 'N/A',
    paymentStatus: orderFound.payment_status,
    deliveryMethod: orderFound.delivery_method?.replace('_', ' ') || 'N/A',
    deliveryAddress: orderFound.delivery_address || 'N/A',
    deliveryTime: orderFound.delivery_time || 'N/A',
    amountPaid: orderFound.total_amount,
    estimatedDelivery: formatDate(orderFound.estimated_delivery ?? ''),
    notes: 'Thank you for choosing our telemedicine services.',
  }

  // handle payment

  const initiatePayment = async () => {
    if (!orderFound) return

    const name =
      `${orderFound?.patient?.first_name} ${orderFound?.patient?.last_name}` ||
      'Patient'

    try {
      const response = await addPayment({
        amount: orderFound.total_amount,
        full_name: name,
        email: orderFound.patient?.email ?? 'user@example.com',
        phone_number: patient?.patientProfile?.phone_number ?? '0000000000',
        order_number: orderFound.order_number,
        payment_method: orderFound.payment_method,
        user: orderFound.patient,
      })

      if (response.message === 'Payment already initiated') {
        toast.info('Payment already initialized, redirecting…')
      }


      const data = response.data

       setPaymentData({
         email: data.email,
         amount: data.amount,
         reference: data.paystack_reference,
       })
       setShowPaystack(true)
    } catch (error) {
      console.error('Failed to initiate payment:', error)
      const message = getErrorMessage(error)
      toast.error(message)
    }
  }



  const Icon = orderFound.delivery_status
    ? statusIcons[orderFound.delivery_status as keyof typeof statusIcons]
    : undefined
  const statusPercentage = getStatusPercentage(
    orderFound.delivery_status || 'pending',
  )


  const updateOrderByStatus = async (status: DeliveryStatus) => {
    if (!orderFound) return

    try {
      await updateOrderStatus({
        id: orderFound.order_id!,
        status: status as DeliveryStatus,
      })

      toast.success(`Order status updated to ${status}`)
    } catch (error) {
      console.error('Failed to update order status:', error)
      const message = getErrorMessage(error)
      toast.error(message)
    }

  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* update order status */}
        {(role === 'admin' || role === 'pharmacy') && (
          <div className="mb-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-blue-200 dark:border-blue-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Update Order Status
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Change the delivery status of this order.
                </p>
              </div>
              <Select
                value={orderFound.delivery_status}
                onValueChange={(value) =>
                  updateOrderByStatus(value as DeliveryStatus)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="cursor-pointer"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
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
            <div>
              {orderFound.payment_status !== PaymentStatus.PAID &&
                role === 'patient' && (
                  <button
                    className="inline-flex items-center px-4 py-2 cursor-pointer bg-blue-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                    type="button"
                    onClick={initiatePayment}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {verifying ? 'Processing...' : 'Checkout'}
                  </button>
                )}
              {showPaystack && paymentData && (
                <PaystackModal
                  email={paymentData.email}
                  amount={paymentData.amount}
                  reference={paymentData.reference}
                  onSuccess={(ref) => {
                    setShowPaystack(false)
                    verifyPayment({ reference: ref })
                  }}
                  onClose={() => setShowPaystack(false)}
                />
              )}
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
              {statusSteps
                .filter((step) => {
                  // Omit "cancelled" if order is past "processing"
                  if (
                    step.id === 'cancelled' &&
                    ['processing', 'shipped', 'delivered'].includes(
                      orderFound.delivery_status ?? '',
                    )
                  ) {
                    return false
                  }
                  return true
                })
                .map((step) => (
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
                  {patient?.patientProfile?.address || 'N/A'}
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
                  {formatCurrency(orderFound.total_amount || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        {orderFound.orderMedications?.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Prescription Items
            </h2>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {orderFound.orderMedications.map((med: TOrderMedication) => (
                <div
                  key={med.medication_id}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {med?.medication?.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {med?.medication?.dosage}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(med.total_amount || 0)}
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
        )}

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Order Summary
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <p className="text-gray-500 dark:text-gray-400">Subtotal</p>
              <p className="text-gray-800 dark:text-gray-200">
                {formatCurrency(orderFound.total_amount || 0)}
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
                {formatCurrency(orderFound.total_amount || 0)}
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
