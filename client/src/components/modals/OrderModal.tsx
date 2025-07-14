import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, User, ShoppingCart, CreditCard } from 'lucide-react'
import type { TOrderMedication } from '@/types/api-types'
import { useAuthStore } from '@/store/store'
import {
  useCreatePatientProfile,
  useGetPatientProfileByUserId,
  useUpdatePatientProfile,
} from '@/hooks/usePatientProfile'
import { useCreateOrder } from '@/hooks/useOrders'
import { toast } from 'sonner'
import { DeliveryMethod, PaymentMethod } from '@/types/api-types'
import { useCartStore } from '@/store/cart/add'
import type { TPatient } from '@/types/Tuser'
import { useUserData } from '@/hooks/useDashboard'
import { Link } from '@tanstack/react-router'

// 🧭 Step Indicator Component
const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Order Details', icon: ShoppingCart },
    { number: 3, title: 'Payment', icon: CreditCard },
  ]

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isCompleted = step.number < currentStep
        const isActive = step.number === currentStep

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
              <span
                className={`mt-2 text-sm font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-4 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [personalInfo, setPersonalInfo] = useState<TPatient | null>(null)
  const { cart, clearCart,totalAmount } = useCartStore()
  const { user } = useAuthStore()
  const patientId = user?.userId || ''
  const createOrder = useCreateOrder()

  // Transform cart items to order medications format
  const orderMedications: TOrderMedication[] = cart
    .filter((item) => typeof item.medication_id === 'string')
    .map((item) => ({
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_amount: item.total_price,
      medication_id: item.medication_id as string,
    }))

  // Personal Info Form Submit Handler
  const handlePersonalInfoSubmit = async (data: TPatient) => {
    setPersonalInfo(data)
    setCurrentStep(2)
  }

  // Order Details Form Submit Handler
  const handleOrderSubmit = async (orderData: any) => {
    try {
      const completeOrder = {
        ...orderData,
        patient_id: patientId,
        medications: orderMedications,
        total_amount: totalAmount,
      }

      
      await createOrder.mutateAsync(completeOrder)

      toast.success('Order placed successfully!')
      clearCart()
      setCurrentStep(3) // Move to success/payment step
    } catch (error) {
      console.error('Order submission failed:', error)
      toast.error('Failed to place order')
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <StepIndicator currentStep={currentStep} />

        {currentStep === 1 && (
          <PersonalInfoStep
            onSubmit={handlePersonalInfoSubmit}
            userInfo={personalInfo}
          />
        )}

        {currentStep === 2 && (
          <OrderDetailsStep
            medications={orderMedications}
            totalAmount={totalAmount()}
            onSubmit={handleOrderSubmit}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && <OrderConfirmationStep />}
      </div>
    </div>
  )
}

// Personal Info Step Component
const PersonalInfoStep = ({
  onSubmit,
  userInfo,
}: {
  onSubmit: (data: TPatient) => void
  userInfo: TPatient | null
}) => {
  const { user } = useAuthStore()
  const patientId = user?.userId || ''
  const { profileData } = useUserData()
  const profile = profileData?.patientProfile || null

  const createProfile = useCreatePatientProfile()
  const updateProfile = useUpdatePatientProfile()

  const [formData, setFormData] = useState<TPatient>({
    address: userInfo?.address || profile?.address || '',
    phone_number: userInfo?.phone_number || profile?.phone_number || '',
    state: userInfo?.state || profile?.state || '',
    city: userInfo?.city || profile?.city || '',
    postal_code: userInfo?.postal_code || profile?.postal_code || '',
    age: userInfo?.age || profile?.age || 0,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof TPatient, string>>>(
    {},
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev: TPatient) => ({ ...prev, [name]: value }))
    if (errors[name as keyof TPatient]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Partial<Record<keyof TPatient, string>> = {}
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.phone_number.trim())
      newErrors.phone_number = 'Phone number is required'
    if (!formData.state?.trim()) newErrors.state = 'State is required'
    if (!formData.city?.trim()) newErrors.city = 'City is required'
    if (!formData.postal_code?.trim())
      newErrors.postal_code = 'Postal code is required'
    if (formData.age <= 0) newErrors.age = 'Age must be a positive number'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    const payload = { ...formData, patient_id: patientId }

    try {
      if (profileData) {
        await updateProfile.mutateAsync({ id: patientId, data: payload })
      } else {
        await createProfile.mutateAsync(payload)
      }
      onSubmit(payload)
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save personal information')
    }
  }

  const inputStyle =
    'w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary'
  const labelStyle =
    'block text-sm font-semibold mb-2 text-gray-800 dark:text-white'
  const errorStyle = 'text-red-500 text-sm mt-1'

  // ✅ Show existing profile summary if profileData exists
  if (profile) {
    return (
      <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
            Shipping Details
          </CardTitle>
          <p className="text-gray-600 dark:text-white">
            Please confirm your shipping details
          </p>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700 dark:text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Address:</strong>
              <p>{profile?.address}</p>
            </div>
            <div>
              <strong>Phone:</strong>
              <p>{profile?.phone_number}</p>
            </div>
            <div>
              <strong>City:</strong>
              <p>{profile?.city}</p>
            </div>
            <div>
              <strong>State:</strong>
              <p>{profile?.state}</p>
            </div>
            <div>
              <strong>Postal Code:</strong>
              <p>{profile?.postal_code}</p>
            </div>
            <div>
              <strong>Age:</strong>
              <p>{profile?.age}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer"
              onClick={() => onSubmit(profile)}
            >
              Confirm & Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 📝 Show editable form if profileData does not exist
  return (
    <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
          Personal Information
        </CardTitle>
        <p className="text-gray-600 dark:text-white">
          Please provide your contact details
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(
              [
                'address',
                'phone_number',
                'state',
                'city',
                'postal_code',
                'age',
              ] as const
            ).map((field) => (
              <div key={field} className="md:col-span-1">
                <label htmlFor={field} className={labelStyle}>
                  {field
                    .replace('_', ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </label>
                <input
                  type={field === 'age' ? 'number' : 'text'}
                  id={field}
                  name={field}
                  value={formData[field] || ''}
                  onChange={handleChange}
                  className={`${inputStyle} ${errors[field] ? 'border-red-500' : ''}`}
                  placeholder={`Enter ${field.replace('_', ' ')}`}
                />
                {errors[field] && (
                  <div className={errorStyle}>{errors[field]}</div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              variant={'ghost'}
              className="px-8 py-3 border border-gray-300 dark:border-gray-800 cursor-pointer"
            >
              Save & Continue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Order Details Step Component
const OrderDetailsStep = ({
  medications,
  totalAmount,
  onSubmit,
  onBack,
}: {
  medications: TOrderMedication[]
  totalAmount: number
  onSubmit: (data: any) => void
  onBack: () => void
}) => {
  const { profileData } = useUserData()
  const profile = profileData?.patientProfile || null

  console.log('cart medications', medications)
  
  const [formData, setFormData] = useState({
    delivery_address: profile?.address || '',
    delivery_method: DeliveryMethod.HOME_DELIVERY,
    payment_method: PaymentMethod.MOBILE_MONEY,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.delivery_address.trim())
      newErrors.delivery_address = 'Delivery address is required'
    if (!formData.delivery_method)
      newErrors.delivery_method = 'Select delivery method'
    if (!formData.payment_method)
      newErrors.payment_method = 'Select payment method'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault()
   if (!validateForm()) {
     toast.error('Please fix the errors in the form')
     return
   }

   setIsSubmitting(true)

   try {
     const payload = {
       ...formData,
       medications: medications.map((med) => ({
         medication: {
           medication_id: med.medication_id || med.medication?.medication_id,
         },
         quantity: med.quantity,
         unit_price: med.unit_price,
         total_amount: med.total_amount,
       })),
     }

     console.log('Final Payload:', payload)

     onSubmit(payload)
   } finally {
     setIsSubmitting(false)
   }
 }

  
  const inputStyle =
    'w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary'
  const labelStyle =
    'block text-sm font-semibold mb-2 text-gray-800 dark:text-white'
  const errorStyle = 'text-red-500 text-sm mt-1'

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white dark:bg-gray-900 rounded-xl shadow-sm"
    >
      <div className="lg:col-span-2">
        <Card className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
              Order Details
            </CardTitle>
            <p className="text-gray-600 dark:text-white">
              Complete your order information
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className={labelStyle}>Delivery Address</label>
              <input
              type="text"
              value={formData.delivery_address}
              disabled={!!formData.delivery_address}
              onChange={(e) =>
                handleChange('delivery_address', e.target.value)
              }
              className={`${inputStyle} ${errors.delivery_address ? 'border-red-500' : ''}`}
              />
              {errors.delivery_address && (
              <div className={errorStyle}>{errors.delivery_address}</div>
              )}
            </div>

            <div>
              <label className={labelStyle}>Delivery Method</label>
              <input
                type="text"
                value={formData.delivery_method}
                disabled
                
                onChange={(e) =>
                  handleChange('delivery_method', e.target.value)
                }
                className={`${inputStyle} ${errors.delivery_method ? 'border-red-500' : ''}`}
              />
              {errors.delivery_method && (
                <div className={errorStyle}>{errors.delivery_method}</div>
              )}
            </div>

            <div>
              <label className={labelStyle}>Payment Method</label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => handleChange('payment_method', value)}
              >
                <SelectTrigger className={inputStyle}>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800">
                  {Object.values(PaymentMethod).map((method) => (
                    <SelectItem key={method} value={method} className='hover:bg-gray-100 dark:hover:bg-gray-700'>
                      {method.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.payment_method && (
                <div className={errorStyle}>{errors.payment_method}</div>
              )}
            </div>

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={onBack}
                className="cursor-pointer"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {isSubmitting ? 'Processing...' : 'Complete Order'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-4 bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700">
          <CardHeader >
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {medications.map((med, index) => (
              <div
                key={index}
                className="flex justify-between py-2 border-b border-gray-200"
              >
                <div>
                  {/* <p className="font-medium">{med.medication.name}</p> */}
                  <p className="text-sm text-gray-500">Qty: {med.quantity}</p>
                </div>
                <p className="font-bold text-green-600">
                  KES {med.total_amount}
                </p>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p className="text-green-600">KES {totalAmount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

// Order Confirmation Step Component
const OrderConfirmationStep = () => {
  return (
    <Card className="max-w-2xl mx-auto text-center bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700">
      <CardHeader>
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
          Order Confirmed!
        </CardTitle>
        <p className="text-gray-600 dark:text-white">
          Thank you for your purchase. Your order has been received.
        </p>
      </CardHeader>
      <CardContent>
        <Link 
        to='/dashboard/orders'
        className="mt-4 underline text-blue-500">View Order Details</Link>
      </CardContent>
    </Card>
  )
}
