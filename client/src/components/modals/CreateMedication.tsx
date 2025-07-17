import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { StockCategory, StockType } from '@/types/api-types'
import type { TMedication } from '@/types/api-types'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateMedication } from '@/hooks/useMedication'

interface EditMedicationDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateMedDialog({
  isOpen,
  onClose,
}: EditMedicationDialogProps) {
    const {mutateAsync: createMedication} = useCreateMedication()


  const [formData, setFormData] = useState<TMedication>({
    name: '',
    dosage: '',
    manufacturer: '',
    expiration_date: new Date(),
    category: StockCategory.ANALGESIC,
    unit_price: 0,
    medication_code: '',
    medication_type: StockType.TABLET,
    stock_quantity: 0,
    prescription_required: false,
  })

  const [sideEffects, setSideEffects] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target
    const isNumeric = type === 'number'

    setFormData((prev) => ({
      ...prev,
      [name]: isNumeric ? parseFloat(value) : value,
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      prescription_required: checked,
    }))
  }

  const handleSelectChange = (name: keyof TMedication, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        expiration_date: date,
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const createMed = {
      ...formData,
      side_effects: sideEffects
        ? sideEffects
            .split(',')
            .map((effect) => effect.trim())
            .filter(Boolean)
        : [],
    }

    createMedication(createMed)
      .then(() => {
        toast.success('Medication created successfully')
        onClose()
      })
      .catch((error) => {
        console.error('Error creating medication:', error)
        toast.error('Failed to create medication')
      })

  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            New Medication
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-4"
        >
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Medication Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                required
              />
            </div>

            <div>
              <Label
                htmlFor="description"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                rows={3}
              />
            </div>

            <div>
              <Label
                htmlFor="dosage"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Dosage *
              </Label>
              <Input
                id="dosage"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                required
              />
            </div>

            <div>
              <Label
                htmlFor="side_effects"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Side Effects
              </Label>
              <Input
                id="side_effects"
                value={sideEffects}
                onChange={(e) => setSideEffects(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                placeholder="Comma-separated list"
              />
            </div>

            <div>
              <Label
                htmlFor="manufacturer"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Manufacturer *
              </Label>
              <Input
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                required
              />
            </div>
          </div>

          {/* center column */}
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="medication_code"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Medication Code *
              </Label>
              <Input
                id="medication_code"
                name="medication_code"
                value={formData.medication_code}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                required
              />
            </div>

            <div>
              <Label
                htmlFor="manufacturer_contact"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Manufacturer Contact
              </Label>
              <Input
                id="manufacturer_contact"
                name="manufacturer_contact"
                value={formData.manufacturer_contact || ''}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>

            <div>
              <Label
                htmlFor="image"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Image URL
              </Label>
              <Input
                id="image"
                name="image"
                value={formData.image || ''}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="prescription_required"
                checked={formData.prescription_required}
                onCheckedChange={handleCheckboxChange}
                className="border-gray-300 dark:border-gray-600"
              />
              <Label
                htmlFor="prescription_required"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Prescription Required
              </Label>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Expiration Date *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expiration_date ? (
                      format(formData.expiration_date, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800">
                  <Calendar
                    mode="single"
                    selected={formData.expiration_date}
                    onSelect={handleDateChange}
                    initialFocus
                    className="rounded-md"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="category"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleSelectChange('category', value as StockCategory)
                  }
                >
                  <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    {Object.values(StockCategory).map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {category.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="medication_type"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Type *
                </Label>
                <Select
                  value={formData.medication_type}
                  onValueChange={(value) =>
                    handleSelectChange('medication_type', value as StockType)
                  }
                >
                  <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    {Object.values(StockType).map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="unit_price"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Unit Price (KES) *
                </Label>
                <Input
                  id="unit_price"
                  name="unit_price"
                  type="number"
                  value={formData.unit_price}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="stock_quantity"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Stock Quantity *
                </Label>
                <Input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  min="0"
                  required
                />
              </div>
            </div>
            <DialogFooter className="md:col-span-2 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-300 dark:border-gray-600 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
