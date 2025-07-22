import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import type z from 'zod'
import { doctorSchema } from '../utils/doctorValidate'

type DoctorFormData = z.infer<typeof doctorSchema>

const validateField = <T,>(value: T, schema: z.ZodType<T>) => {
  const result = schema.safeParse(value)
  if (!result.success) {
    return result.error.issues[0]?.message || 'Validation error'
  }
  return undefined
}

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const fieldConfigs = [
  {
    name: 'license_number',
    label: 'License Number',
    type: 'text',
    required: true,
    placeholder: 'Enter license number',
  },
  {
    name: 'phone_number',
    label: 'Phone Number',
    type: 'text',
    required: true,
    placeholder: 'Enter phone number',
  },
  {
    name: 'specialization',
    label: 'Specialization',
    type: 'text',
    required: true,
    placeholder: 'Enter specialization',
  },
  {
    name: 'years_of_experience',
    label: 'Years of Experience',
    type: 'number',
    required: true,
    placeholder: 'Enter years of experience',
  },
  {
    name: 'education',
    label: 'Education',
    type: 'text',
    required: true,
    placeholder: 'Enter education',
  },
  {
    name: 'department',
    label: 'Department',
    type: 'text',
    required: true,
    placeholder: 'Enter department',
  },
  {
    name: 'availability',
    label: 'Available?',
    type: 'checkbox',
    required: false,
  },
  {
    name: 'sex',
    label: 'Sex',
    type: 'select',
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    name: 'address',
    label: 'Address',
    type: 'text',
    required: true,
    placeholder: 'Enter address',
  },
  {
    name: 'consultation_fee',
    label: 'Consultation Fee',
    type: 'number',
    required: true,
    placeholder: 'Enter fee',
  },
  {
    name: 'days',
    label: 'Available Days',
    type: 'select-multiple',
    options: daysOfWeek.map((d) => ({ label: d, value: d })),
  },
  {
    name: 'start_time',
    label: 'Start Time',
    type: 'time',
  },
  {
    name: 'end_time',
    label: 'End Time',
    type: 'time',
  },
  {
    name: 'avatar',
    label: 'Avatar URL',
    type: 'url',
    placeholder: 'https://example.com/avatar.jpg',
  },
  {
    name: 'bio',
    label: 'Bio',
    type: 'textarea',
    placeholder: 'Write a short bio...',
  },
] as const

function CreateDoctor() {
  const form = useForm<DoctorFormData>({
    defaultValues: {
      license_number: '',
      phone_number: '',
      specialization: '',
      years_of_experience: 0,
      education: '',
      department: '',
      availability: false,
      sex: 'male',
      address: '',
      consultation_fee: 0,
      days: [],
      start_time: '',
      end_time: '',
      avatar: '',
      bio: '',
    },
    onSubmit: async ({ value }) => {
      const parsed = doctorSchema.safeParse(value)
      if (!parsed.success) {
        toast.error('Please fix the validation errors.')
        return
      }
      toast.success('Doctor created!')
      console.log('Doctor:', parsed.data)
    },
  })

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        {fieldConfigs.map((config) => (
          <form.Field
            key={config.name}
            name={config.name}
            validators={{
              onChange: (value) =>
                validateField(
                  value,
                  // @ts-expect-error: dynamic access, types are compatible at runtime
                  doctorSchema.shape[config.name]
                ),
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {config.label}
                </label>

                {config.type === 'textarea' ? (
                  <textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder={config.placeholder}
                  />
                ) : config.type === 'select' ? (
                  <select
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    {config.options!.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : config.type === 'select-multiple' ? (
                  <select
                    multiple
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(
                        Array.from(e.target.selectedOptions).map(
                          (o) => o.value,
                        ),
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    {config.options!.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : config.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                ) : (
                  <input
                    type={config.type}
                    value={
                      typeof field.state.value === 'number'
                        ? field.state.value.toString()
                        : typeof field.state.value === 'boolean'
                        ? ''
                        : (field.state.value ?? '')
                    }
                    onChange={(e) => {
                      let val: any;
                      if (config.type === 'number') {
                        val = Number(e.target.value);
                      } else if (config.type === 'checkbox') {
                        val = e.target.checked;
                      } else {
                        val = e.target.value;
                      }
                      field.handleChange(val);
                    }}
                    placeholder={config.placeholder ?? ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                )}

                {field.state.meta.errors?.[0] && (
                  <div className="flex items-center mt-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {field.state.meta.errors[0]}
                  </div>
                )}
              </div>
            )}
          </form.Field>
        ))}

        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-6 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                canSubmit
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-400 cursor-not-allowed text-gray-200'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Doctor'}
            </button>
          )}
        </form.Subscribe>
      </form>
    </div>
  )
}

export default CreateDoctor
