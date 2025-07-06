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

import { Calendar, Clock } from 'lucide-react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

import { ConsultationType } from '@/types/api-types'

interface AddAppointmentModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: any) => void
}

const validationSchema = Yup.object({
  doctorName: Yup.string().required('Doctor name is required'),
  appointmentDate: Yup.string().required('Appointment date is required'),
  appointmentTime: Yup.string().required('Time is required'),
  consultationType: Yup.string().required('Consultation type is required'),
  notes: Yup.string(),
})

export const AppointmentModal = ({
  open,
  onClose,
  onSubmit,
}: AddAppointmentModalProps) => {
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

        <Formik
          initialValues={{
            doctorName: '',
            appointmentDate: '',
            appointmentTime: '',
            consultationType: '',
            notes: '',
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { resetForm }) => {
            onSubmit(values)
            resetForm()
            onClose()
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              {/* Doctor Name */}
              <div className="space-y-2">
                <Label htmlFor="doctorName">Doctor Name</Label>
                <Field
                  as={Input}
                  name="doctorName"
                  placeholder="e.g. Dr. John Doe"
                />
                <p className="text-red-500 text-sm mt-1">
                  <ErrorMessage name="doctorName" />
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Appointment Date */}
                <div className="space-y-2">
                  <Label htmlFor="appointmentDate">Date</Label>
                  <Field
                    as={Input}
                    type="date"
                    name="appointmentDate"
                    icon={<Calendar className="w-4 h-4" />}
                  />
                  <p className="text-red-500 text-sm mt-1">
                    <ErrorMessage name="appointmentDate" />
                  </p>
                </div>
                {/* Time */}
                <div className="space-y-2">
                  <Label htmlFor="appointmentTime">Time</Label>
                  <Field
                    as={Input}
                    type="time"
                    name="appointmentTime"
                    icon={<Clock className="w-4 h-4" />}
                  />
                  <p className="text-red-500 text-sm mt-1">
                    <ErrorMessage name="appointmentTime" />
                  </p>
                </div>
              </div>

              {/* Consultation Type */}
              <div className="space-y-2">
                <Label htmlFor="consultationType">Consultation Type</Label>
                <Field name="consultationType">
                  {({ field }: any) => (
                    <Select
                      onValueChange={field.onChange(field.name)}
                      defaultValue=""
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
                  )}
                </Field>
                <p className="text-red-500 text-sm mt-1">
                  <ErrorMessage name="consultationType" />
                </p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Field
                  as={Textarea}
                  name="notes"
                  placeholder="Additional info..."
                />
              </div>

              <DialogFooter>
                <Button type="submit" className='cursor-pointer' disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Create Appointment'}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}
