import { useState } from 'react'
import { useFormik } from 'formik'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCreatePrescription } from '@/hooks/usePrescriptions'
import { useGetMedications } from '@/hooks/useMedication'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2 } from 'lucide-react'

interface PrescriptionItem {
  medication_id: string
  dosage_instructions: string[]
  duration_days: string
  frequency_per_day: string
  quantity_prescribed: string
}

export default function PrescriptionFormSheet({
  diagnosisId,
  onSuccess,
}: {
  diagnosisId: string
  onSuccess?: () => void
}) {
  const { mutateAsync: create, isPending } = useCreatePrescription()
  const { data } = useGetMedications()
  const medications = data?.data || []
  const {toast} = useToast()

  // Initialize with one empty prescription item
  const [prescriptionItems, setPrescriptionItems] = useState<
    PrescriptionItem[]
  >([
    {
      medication_id: '',
      dosage_instructions: [],
      duration_days: '',
      frequency_per_day: '',
      quantity_prescribed: '',
    },
  ])

  const formik = useFormik({
    initialValues: {
      diagnosis_id: diagnosisId,
      items: prescriptionItems,
    },
    onSubmit: async (values) => {
      // Validate each prescription item
      console.log('values',values)
      const hasErrors = prescriptionItems.some((item) => {
        return (
          !item.medication_id ||
          item.dosage_instructions.length === 0 ||
          !item.duration_days ||
          !item.frequency_per_day ||
          !item.quantity_prescribed
        )
      })

      console.log("errors", hasErrors)

      if (hasErrors) {
        toast({
          title: 'Form validation failed',
          description: 'Please fix the errors in the form.',
          variant: 'destructive',
        })
        return
      }

      const payload = {
        diagnosis_id: diagnosisId,
        items: prescriptionItems.map((item) => ({
          medication_id: item.medication_id,
          dosage_instructions: item.dosage_instructions,
          duration_days: Number(item.duration_days),
          frequency_per_day: Number(item.frequency_per_day),
          quantity_prescribed: Number(item.quantity_prescribed),
        })),
      }

      console.log("payload", payload)

      try {
        await create(payload)
        toast({
          title: 'Prescription created successfully',
          description: 'Your prescription has been created.',
          variant: 'success',
        })
        formik.resetForm()
        setPrescriptionItems([
          {
            medication_id: '',
            dosage_instructions: [],
            duration_days: '',
            frequency_per_day: '',
            quantity_prescribed: '',
          },
        ])
        onSuccess?.()
      } catch (err) {
        toast({
          title: 'Failed to create prescription',
          description: 'There was an error creating your prescription.',
          variant: 'destructive',
        })
      }
    },
  })

  const addMedicationItem = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      {
        medication_id: '',
        dosage_instructions: [],
        duration_days: '',
        frequency_per_day: '',
        quantity_prescribed: '',
      },
    ])
  }

  console.log('prescribed', prescriptionItems)

  const removeMedicationItem = (index: number) => {
    if (prescriptionItems.length <= 1) return
    const newItems = [...prescriptionItems]
    newItems.splice(index, 1)
    setPrescriptionItems(newItems)
  }

  const handleMedicationChange = (value: string, index: number) => {
    const newItems = [...prescriptionItems]
    newItems[index].medication_id = value
    setPrescriptionItems(newItems)
  }

  const addDosageInstruction = (index: number, instruction: string) => {
    const trimmed = instruction.trim()
    if (!trimmed) return

    const newItems = [...prescriptionItems]
    newItems[index].dosage_instructions = [
      ...newItems[index].dosage_instructions,
      trimmed,
    ]
    setPrescriptionItems(newItems)
  }

  const removeDosageInstruction = (itemIndex: number, dosageIndex: number) => {
    const newItems = [...prescriptionItems]
    newItems[itemIndex].dosage_instructions.splice(dosageIndex, 1)
    setPrescriptionItems(newItems)
  }

  const updateItemField = (
    index: number,
    field: keyof PrescriptionItem,
    value: string,
  ) => {
    const newItems = [...prescriptionItems]
    if (field === 'dosage_instructions') {
      // If updating dosage_instructions, wrap value in array
      newItems[index][field] = [value] as any
    } else {
      newItems[index][field] = value as any
    }
    setPrescriptionItems(newItems)
  }

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {prescriptionItems.map((item, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Medication #{index + 1}</h3>
              {prescriptionItems.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMedicationItem(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>

            {/* Medication Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Medication
              </label>
              <Select
                value={item.medication_id}
                onValueChange={(value) => handleMedicationChange(value, index)}
              >
                <SelectTrigger className="w-full border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary">
                  <SelectValue placeholder="Select medication" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800">
                  {medications.map((med) => (
                    <SelectItem
                      key={med.medication_id}
                      value={med.medication_id ?? ''}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {med.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dosage Instructions */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Dosage Instructions
              </label>
              <div className="flex gap-2 items-end">
                <Input
                  placeholder="Add dosage instruction"
                  className="border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addDosageInstruction(index, e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
                <Button
                  type="button"
                  className="cursor-pointer"
                  onClick={(e) => {
                    const input = e.currentTarget
                      .previousElementSibling as HTMLInputElement
                    addDosageInstruction(index, input.value)
                    input.value = ''
                  }}
                >
                  Add
                </Button>
              </div>

              {item.dosage_instructions.length > 0 && (
                <ul className="mt-2 text-sm pl-5 text-gray-600 dark:text-gray-300 list-disc">
                  {item.dosage_instructions.map((d, i) => (
                    <li key={i} className="flex justify-between items-center">
                      <span>{d}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDosageInstruction(index, i)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Medication Details */}
            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="Duration (days)"
                type="number"
                min="1"
                className="border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                value={item.duration_days}
                onChange={(e) =>
                  updateItemField(index, 'duration_days', e.target.value)
                }
              />
              <Input
                placeholder="Frequency per day"
                type="number"
                min="1"
                className="border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                value={item.frequency_per_day}
                onChange={(e) =>
                  updateItemField(index, 'frequency_per_day', e.target.value)
                }
              />
              <Input
                placeholder="Quantity"
                type="number"
                min="1"
                className="border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                value={item.quantity_prescribed}
                onChange={(e) =>
                  updateItemField(index, 'quantity_prescribed', e.target.value)
                }
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          onClick={addMedicationItem}
          variant="outline"
          className="flex items-center gap-2 cursor-pointer text-blue-500 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Add Another Medication
        </Button>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full cursor-pointer"
      >
        {isPending ? 'Creating...' : 'Create Prescription'}
      </Button>
    </form>
  )
}
