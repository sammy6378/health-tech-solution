import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useFormik } from 'formik'
import * as yup from 'yup'
import React from 'react'
import { useUpdatePatientProfile } from '@/hooks/usePatientProfile'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicationName: string
  medication_id: string
  patient_id: string
  onSubmit: (formValues: any) => void
}

const validationSchema = yup.object().shape({
  address: yup.string().required('Address is required'),
  phone_number: yup.string().required('Phone number is required'),
  state: yup.string().required('State is required'),
  city: yup.string().required('City is required'),
  zip_code: yup.string().required('Zip code is required'),
  delivery_address: yup.string().required('Delivery address is required'),
  delivery_method: yup.string().required('Select delivery method'),
  payment_method: yup.string().required('Select payment method'),
})

export default function OrderModal({
  open,
  onOpenChange,
  medicationName,
  medication_id,
  patient_id,
  onSubmit,
}: Props) {
  const [step, setStep] = React.useState(1)
  const [isSavingProfile, setIsSavingProfile] = React.useState(false)
  const [isSubmittingOrder, setIsSubmittingOrder] = React.useState(false)

  const { mutateAsync: updateProfile } = useUpdatePatientProfile()

  const { values, handleChange, handleBlur, handleSubmit, errors, touched } =
    useFormik({
      initialValues: {
        address: '',
        phone_number: '',
        state: '',
        city: '',
        zip_code: '',
        delivery_address: '',
        delivery_method: '',
        payment_method: '',
      },
      validationSchema,
      onSubmit: async (values) => {
        try {
          setIsSubmittingOrder(true)
          await saveOrderInfo(values)
          onOpenChange(false)
          setStep(1)
        } catch (error) {
          console.error('Error submitting order:', error)
        } finally {
          setIsSubmittingOrder(false)
        }
      },
    })

  const saveOrderInfo = async (orderInfo: any) => {
    const orderData = {
      ...orderInfo,
      medication_id,
      patient_id,
    }
    await onSubmit(orderData)
  }

  const saveUserInfo = async (userInfo: {
    address: string
    phone_number: string
    state: string
    city: string
    zip_code: string
  }) => {
    setIsSavingProfile(true)
    try {
      await updateProfile({
        id: patient_id,
        data: {
          ...userInfo,
          patient_id,
        },
      })
      setStep(2)
    } catch (error) {
      console.error('Error saving user info:', error)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const inputStyle =
    'w-full px-4 py-2 border rounded-lg dark:bg-gray-800 bg-white border-gray-300 dark:border-gray-700 text-sm'
  const labelStyle =
    'block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300'
  const errorStyle = 'text-red-500 text-xs mt-1'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-900 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Order: {medicationName}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="text-sm font-medium text-center text-muted-foreground">
          Step {step} of 2: {step === 1 ? 'Personal Info' : 'Order Info'}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {step === 1 && (
            <>
              {(
                [
                  'address',
                  'phone_number',
                  'state',
                  'city',
                  'zip_code',
                ] as const
              ).map((field) => (
                <div key={field}>
                  <label htmlFor={field} className={labelStyle}>
                    {field
                      .replace('_', ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </label>
                  <input
                    type="text"
                    id={field}
                    name={field}
                    value={values[field]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${inputStyle} ${
                      errors[field] && touched[field] ? 'border-red-500' : ''
                    }`}
                    placeholder={`Enter ${field.replace('_', ' ')}`}
                  />
                  {errors[field] && touched[field] && (
                    <div className={errorStyle}>{errors[field]}</div>
                  )}
                </div>
              ))}
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() =>
                    saveUserInfo({
                      address: values.address,
                      phone_number: values.phone_number,
                      state: values.state,
                      city: values.city,
                      zip_code: values.zip_code,
                    })
                  }
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? 'Saving...' : 'Save & Next'}
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label htmlFor="delivery_address" className={labelStyle}>
                  Delivery Address
                </label>
                <input
                  type="text"
                  id="delivery_address"
                  name="delivery_address"
                  value={values.delivery_address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputStyle} ${
                    errors.delivery_address && touched.delivery_address
                      ? 'border-red-500'
                      : ''
                  }`}
                  placeholder="Enter delivery address"
                />
                {errors.delivery_address && touched.delivery_address && (
                  <div className={errorStyle}>{errors.delivery_address}</div>
                )}
              </div>

              <div>
                <label className={labelStyle}>Delivery Method</label>
                <Select
                  value={values.delivery_method}
                  onValueChange={(v) =>
                    handleChange({
                      target: { name: 'delivery_method', value: v },
                    })
                  }
                >
                  <SelectTrigger className={`${inputStyle} p-0`}>
                    <SelectValue placeholder="Select Delivery Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="home_delivery">Home Delivery</SelectItem>
                  </SelectContent>
                </Select>
                {errors.delivery_method && touched.delivery_method && (
                  <div className={errorStyle}>{errors.delivery_method}</div>
                )}
              </div>

              <div>
                <label className={labelStyle}>Payment Method</label>
                <Select
                  value={values.payment_method}
                  onValueChange={(v) =>
                    handleChange({
                      target: { name: 'payment_method', value: v },
                    })
                  }
                >
                  <SelectTrigger className={`${inputStyle} p-0`}>
                    <SelectValue placeholder="Select Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payment_method && touched.payment_method && (
                  <div className={errorStyle}>{errors.payment_method}</div>
                )}
              </div>

              <div className="flex justify-between">
                <Button type="button" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" disabled={isSubmittingOrder}>
                  {isSubmittingOrder ? 'Submitting...' : 'Submit Order'}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
