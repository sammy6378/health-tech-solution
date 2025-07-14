import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import {
  useCreateAppointment,
  useGetAppointmentsByTimeSlots,
} from '@/hooks/useAppointments'
import { Calendar} from 'lucide-react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { ConsultationType } from '@/types/api-types'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/store'
import { getErrorMessage } from '../utils/handleError'

interface AddAppointmentModalProps {
  open: boolean
  onClose: () => void
  doctorId: string
  timeSlots?: { start: string; end: string }
  name?: string
}

export const AppointmentModal = ({
  open,
  onClose,
  doctorId,
  timeSlots = { start: '08:00', end: '17:00' },
  name = '',
}: AddAppointmentModalProps) => {
  const [selectedDate, setSelectedDate] = useState('')
  const { data: bookedAppointments } = useGetAppointmentsByTimeSlots(selectedDate,doctorId)
  const { mutateAsync: addAppointment } = useCreateAppointment()
  const {user} = useAuthStore()
  const userId = user.userId;

  const bookedTimes = (bookedAppointments?.data || []).map(
    (appt) => appt.start_time,
  )

  const generateTimeSlots = (start: string, end: string) => {
    const slots: string[] = []
    let [startHour, startMin] = start.split(':').map(Number)
    const [endHour, endMin] = end.split(':').map(Number)

    while (
      startHour < endHour ||
      (startHour === endHour && startMin < endMin)
    ) {
      slots.push(
        `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`,
      )
      startHour++
    }

    return slots.filter((slot) => !bookedTimes.includes(slot))
  }

  const availableSlots = generateTimeSlots(timeSlots.start, timeSlots.end)

  const formik = useFormik({
    initialValues: {
      doctorName: name || '',
      appointment_date: '',
      start_time: '',
      consultation_type: '',
      reason: '',
      notes: '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      doctorName: Yup.string().required('Doctor name is required'),
      appointment_date: Yup.string()
        .required('Appointment date is required')
        .test('is-future-date', 'Cannot be in the past', (value) => {
          if (!value) return true
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const selected = new Date(value)
          return selected >= today
        }),
      start_time: Yup.string().required('Start time is required'),
      consultation_type: Yup.string()
        .oneOf(Object.values(ConsultationType), 'Invalid consultation type')
        .required('Consultation type is required'),
      reason: Yup.string().required('Appointment reason is required'),
      notes: Yup.string(),
    }),
    onSubmit: async (values, { resetForm }) => {
      const [startH, startM] = values.start_time.split(':').map(Number)
      const endDate = new Date()
      endDate.setHours(startH + 1, startM)
      const end_time = `${String(endDate.getHours()).padStart(2, '0')}:${String(
        endDate.getMinutes(),
      ).padStart(2, '0')}`

      const appointmentData = {
        ...values,
        doctor_id: doctorId,
        patient_id: userId,
        end_time,
        duration_minutes: 60,
        consultation_type: values.consultation_type as ConsultationType,
      }

      try {
        await addAppointment(appointmentData)
        toast.success('Appointment added successfully!')
        resetForm()
        onClose()
      } catch (error) {
        toast.error(getErrorMessage(error))
      }
    },
  })

  useEffect(() => {
    if (formik.values.appointment_date !== selectedDate) {
      setSelectedDate(formik.values.appointment_date)
    }
  }, [formik.values.appointment_date])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            New Appointment
          </DialogTitle>
          <DialogDescription>
            Fill in the appointment details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doctorName">Doctor Name</Label>
            <Input
              name="doctorName"
              value={formik.values.doctorName}
              disabled
            />
            {formik.touched.doctorName && formik.errors.doctorName && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.doctorName}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment_date">Date</Label>
              <Input
                type="date"
                name="appointment_date"
                value={formik.values.appointment_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.appointment_date &&
                formik.errors.appointment_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.appointment_date}
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Select
                value={formik.values.start_time}
                onValueChange={(val) => formik.setFieldValue('start_time', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.length ? (
                    availableSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No available slots
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {formik.touched.start_time && formik.errors.start_time && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.start_time}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="consultation_type">Consultation Type</Label>
            <Select
              value={formik.values.consultation_type}
              onValueChange={(val) =>
                formik.setFieldValue('consultation_type', val)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ConsultationType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.consultation_type &&
              formik.errors.consultation_type && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.consultation_type}
                </p>
              )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Appointment Reason</Label>
            <Textarea
              name="reason"
              value={formik.values.reason}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter the reason for the appointment"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              name="notes"
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Additional info..."
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Saving...' : 'Create Appointment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
