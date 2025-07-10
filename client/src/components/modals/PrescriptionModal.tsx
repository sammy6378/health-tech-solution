import { useParams } from '@tanstack/react-router'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useCreatePrescription } from '@/hooks/usePrescriptions'
import { toast } from 'sonner'
import { useUserData } from '@/hooks/useUserHook'
import { useGetMedications } from '@/hooks/useMedication'
import { useGetDiagnosis } from '@/hooks/useDiagnosis'

const PrescriptionCreatePage = () => {
  const { dgs } = useParams({strict: false})
  if(!dgs) {
    throw new Error('Diagnosis ID is required')
  };
  const {data: diagnosis} = useGetDiagnosis(dgs)
  const patientId = diagnosis?.data.patient?.user_id
  const {user} = useUserData()

  const doctorId = user?.user_id;
  const { mutateAsync: create, isPending } = useCreatePrescription()
  const { data } = useGetMedications()
  const medications = data?.data || []

  const [dosages, setDosages] = useState<string[]>([])

  const formik = useFormik({
    initialValues: {
      duration_days: '',
      frequency_per_day: '',
      quantity_prescribed: '',
      unit_price: '',
      dosage_input: '',
      notes: '',
      medication_ids: [] as string[],
    },
    validationSchema: Yup.object({
      duration_days: Yup.number().required().positive().integer(),
      frequency_per_day: Yup.number().required().positive().integer(),
      quantity_prescribed: Yup.number().required().positive(),
      unit_price: Yup.number().required().positive(),
      medication_ids: Yup.array().min(1, 'Select at least one medication'),
    }),
    onSubmit: async (values) => {
      const total_price = Number(values.unit_price) * Number(values.quantity_prescribed)
      const payload = {
        ...values,
        duration_days: Number(values.duration_days),
        frequency_per_day: Number(values.frequency_per_day),
        quantity_prescribed: Number(values.quantity_prescribed),
        unit_price: Number(values.unit_price),
        dosage_instructions: dosages,
        total_price,
        doctor_id: doctorId,
        patient_id:patientId,
        diagnosis_id: dgs,
      }

      try {
        await create(payload)
        toast.success('Prescription created successfully')
        formik.resetForm()
        setDosages([])
      } catch (err) {
        toast.error('Failed to create prescription')
      }
    },
  })

  const addDosage = () => {
    if (formik.values.dosage_input.trim()) {
      setDosages([...dosages, formik.values.dosage_input.trim()])
      formik.setFieldValue('dosage_input', '')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Prescription</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="duration_days"
                type="number"
                placeholder="Duration (days)"
                value={formik.values.duration_days}
                onChange={formik.handleChange}
              />
              <Input
                name="frequency_per_day"
                type="number"
                placeholder="Frequency per day"
                value={formik.values.frequency_per_day}
                onChange={formik.handleChange}
              />
              <Input
                name="quantity_prescribed"
                type="number"
                placeholder="Quantity Prescribed"
                value={formik.values.quantity_prescribed}
                onChange={formik.handleChange}
              />
              <Input
                name="unit_price"
                type="number"
                placeholder="Unit Price"
                value={formik.values.unit_price}
                onChange={formik.handleChange}
              />
            </div>

            <div className="flex gap-2 items-end">
              <Input
                name="dosage_input"
                placeholder="Add dosage instruction"
                value={formik.values.dosage_input}
                onChange={formik.handleChange}
              />
              <Button type="button" onClick={addDosage}>
                Add
              </Button>
            </div>

            {dosages.length > 0 && (
              <ul className="list-disc pl-6 text-sm text-gray-600 dark:text-gray-300">
                {dosages.map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
            )}

            <Textarea
              name="notes"
              placeholder="Additional notes"
              value={formik.values.notes}
              onChange={formik.handleChange}
            />

            <label className="block text-sm font-medium mb-1">
              Select Medications
            </label>
            <div className="grid grid-cols-2 gap-2">
              {medications?.map((med) => (
                <label
                  key={med.medication_id}
                  className="flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    name="medication_ids"
                    value={med.medication_id ?? ''}
                    checked={
                      med.medication_id !== undefined &&
                      formik.values.medication_ids.includes(med.medication_id)
                    }
                    onChange={(e) => {
                      const checked = e.target.checked
                      const val = e.target.value
                      const newIds = checked
                        ? [...formik.values.medication_ids, val]
                        : formik.values.medication_ids.filter(
                            (id) => id !== val,
                          )
                      formik.setFieldValue('medication_ids', newIds)
                    }}
                  />
                  <span className="text-sm">{med.name}</span>
                </label>
              ))}
            </div>
            {formik.errors.medication_ids && (
              <div className="text-sm text-red-500">
                {formik.errors.medication_ids}
              </div>
            )}

            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Prescription'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default PrescriptionCreatePage
