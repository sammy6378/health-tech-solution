import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useState, useEffect } from 'react'
import {
  useCreateMedicalRecord,
  useUpdateMedicalRecord,
  useFetchMedicalRecordByUser,
} from '@/hooks/useRecords'
import { useToast } from '@/hooks/use-toast'

type BmiModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient_id: string
}

const bmiSchema = yup.object().shape({
  height: yup.number().required('Height is required').min(50).max(300),
  weight: yup.number().required('Weight is required').min(10).max(500),
})

export default function BmiModal({
  open,
  onOpenChange,
  patient_id,
}: BmiModalProps) {
  const { data: existingRecord, refetch } =
    useFetchMedicalRecordByUser(patient_id)
    console.log("medical_records", existingRecord)
  const { mutateAsync: createRecord } = useCreateMedicalRecord()
  const { mutateAsync: updateRecord } = useUpdateMedicalRecord()
  const { toast } = useToast()

  const [bmiResult, setBmiResult] = useState<null | {
    bmi: number
    category: string
  }>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) refetch()
  }, [open, refetch])

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight'
    if (bmi < 25) return 'Normal'
    if (bmi < 30) return 'Overweight'
    return 'Obese'
  }

  const {
    values,
    handleChange,
    handleBlur,
    handleSubmit,
    errors,
    touched,
    resetForm,
  } = useFormik({
    initialValues: {
      height: '',
      weight: '',
    },
    validationSchema: bmiSchema,
    onSubmit: async (values) => {
      const heightInMeters = Number(values.height) / 100
      const bmi = Number(values.weight) / (heightInMeters * heightInMeters)
      const roundedBmi = parseFloat(bmi.toFixed(2))
      const category = getBmiCategory(roundedBmi)

      setBmiResult({ bmi: roundedBmi, category })

      try {
        setLoading(true)

        const payload = {
          bmi: roundedBmi,
          height: Number(values.height),
          weight: Number(values.weight)
        }

        const record = existingRecord?.data;
        const recordId = record?.record_id

        if (recordId) {
          await updateRecord({ id: recordId, data: payload })
          toast({
            title: 'BMI record updated successfully',
            description: 'Your BMI record has been updated.',
            variant: 'success',
          })
          // close modal
          onOpenChange(false)

        } else {
          await createRecord(payload)
          toast({
            title: 'BMI record created successfully',
            description: 'Your BMI record has been created.',
            variant: 'success',
          })
          // close modal
          onOpenChange(false)
        }
      } catch (err) {
        console.error('Failed to save BMI record:', err)
        toast({
          title: 'Failed to save BMI record',
          description: 'There was an error saving your BMI record.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
        resetForm()
      }
    },
  })

  const inputStyle =
    'w-full px-4 py-2 border rounded-lg dark:bg-gray-800 bg-white border-gray-300 dark:border-gray-700 text-sm'
  const labelStyle =
    'block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300'
  const errorStyle = 'text-red-500 text-xs mt-1'

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          resetForm()
          setBmiResult(null)
        }
        onOpenChange(open)
      }}
    >
      <DialogContent className="bg-white dark:bg-gray-900 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            BMI Calculator
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="height" className={labelStyle}>
              Height (cm)
            </label>
            <input
              type="number"
              id="height"
              name="height"
              value={values.height}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputStyle} ${
                errors.height && touched.height ? 'border-red-500' : ''
              }`}
              placeholder="e.g. 170"
            />
            {errors.height && touched.height && (
              <div className={errorStyle}>{errors.height}</div>
            )}
          </div>

          <div>
            <label htmlFor="weight" className={labelStyle}>
              Weight (kg)
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={values.weight}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${inputStyle} ${
                errors.weight && touched.weight ? 'border-red-500' : ''
              }`}
              placeholder="e.g. 65"
            />
            {errors.weight && touched.weight && (
              <div className={errorStyle}>{errors.weight}</div>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" className='cursor-pointer' disabled={loading}>
              {loading ? 'Saving...' : 'Calculate & Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
