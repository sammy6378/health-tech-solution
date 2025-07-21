import { useState } from 'react'
import { useFormik } from 'formik'
import { z } from 'zod'
import { 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  DollarSign,
  Calendar,
  Upload,
  Stethoscope,
  GraduationCap,
  Building,
  Award,
  Save,
  X
} from 'lucide-react'

// Define the Gender type
type Gender = 'Male' | 'Female'

// Zod schema for validation
const doctorSchema = z.object({
  license_number: z.string().min(1, 'License number is required'),
  phone_number: z.string().optional(),
  specialization: z.string().optional(),
  years_of_experience: z.number().min(0, 'Years of experience must be 0 or greater'),
  education: z.string().min(1, 'Education is required'),
  department: z.string().min(1, 'Department is required'),
  availability: z.boolean(),
  sex: z.enum(['Male', 'Female']),
  address: z.string().min(1, 'Address is required'),
  consultation_fee: z.number().min(0, 'Consultation fee must be 0 or greater').optional(),
  days: z.array(z.string()).optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  avatar: z.string().url('Please provide a valid URL for avatar'),
  bio: z.string().optional(),
})

type DoctorFormData = z.infer<typeof doctorSchema>

// Convert Zod errors to Formik-compatible format
const validateWithZod = (values: DoctorFormData) => {
  try {
    doctorSchema.parse(values)
    return {}
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.reduce((acc, curr) => {
        acc[curr.path.join('.')] = curr.message
        return acc
      }, {} as Record<string, string>)
    }
    return {}
  }
}

const departments = [
  'Cardiology',
  'Dermatology',
  'Emergency Medicine',
  'Family Medicine',
  'Internal Medicine',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery',
  'Urology'
]

const specializations = [
  'Cardiologist',
  'Dermatologist',
  'Emergency Physician',
  'Family Physician',
  'Internist',
  'Neurologist',
  'Oncologist',
  'Orthopedic Surgeon',
  'Pediatrician',
  'Psychiatrist',
  'Radiologist',
  'Surgeon',
  'Urologist'
]

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const CreateDoctorForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const formik = useFormik<DoctorFormData>({
    initialValues: {
      license_number: '',
      phone_number: '',
      specialization: '',
      years_of_experience: 0,
      education: '',
      department: '',
      availability: true,
      sex: 'Male' as Gender,
      address: '',
      consultation_fee: undefined,
      days: [],
      start_time: '',
      end_time: '',
      avatar: '',
      bio: '',
    },
    validate: validateWithZod,
    onSubmit: async (values) => {
      setIsSubmitting(true)
      setSubmitMessage('')
      
      try {
        
        setSubmitMessage('Doctor created successfully!')
        
        // Reset form after successful submission
        formik.resetForm()
      } catch (error) {
        setSubmitMessage('Error creating doctor. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  const handleDayToggle = (day: string) => {
    const currentDays = formik.values.days || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day]
    
    formik.setFieldValue('days', newDays)
  }

  const InputField = <K extends keyof DoctorFormData>({ 
    label, 
    name, 
    type = 'text', 
    placeholder, 
    icon: Icon,
    required = false 
  }: {
    label: string
    name: K
    type?: string
    placeholder?: string
    icon?: any
    required?: boolean
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        )}
        <input
          type={type}
          name={name as string}
          placeholder={placeholder}
          value={typeof formik.values[name] === 'boolean' ? '' : formik.values[name] ?? ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
            formik.touched[name] && formik.errors[name]
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        />
      </div>
      {formik.touched[name] && formik.errors[name] && typeof formik.errors[name] === 'string' && (
        <p className="text-sm text-red-500">{formik.errors[name]}</p>
      )}
    </div>
  )

  const SelectField = <K extends keyof DoctorFormData>({
    label,
    name,
    options,
    icon: Icon,
    required = false,
  }: {
    label: string
    name: K
    options: string[]
    icon?: any
    required?: boolean
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        )}
        <select
          name={name as string}
          value={
            typeof formik.values[name] === 'boolean'
              ? ''
              : (formik.values[name] ?? '')
          }
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
            formik.touched[name] && formik.errors[name]
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      {formik.touched[name] &&
        formik.errors[name] &&
        typeof formik.errors[name] === 'string' && (
          <p className="text-sm text-red-500">{formik.errors[name]}</p>
        )}
    </div>
  )

  const TextAreaField = <K extends keyof DoctorFormData>({
    label,
    name,
    placeholder,
    rows = 4,
    required = false,
  }: {
    label: string
    name: K
    placeholder?: string
    rows?: number
    required?: boolean
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name as string}
        placeholder={placeholder}
        rows={rows}
        value={
          typeof formik.values[name] === 'boolean'
            ? ''
            : (formik.values[name] ?? '')
        }
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className={`w-full pl-3 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none ${
          formik.touched[name] && formik.errors[name]
            ? 'border-red-500 dark:border-red-400'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      />
      {formik.touched[name] &&
        formik.errors[name] &&
        typeof formik.errors[name] === 'string' && (
          <p className="text-sm text-red-500">{formik.errors[name]}</p>
        )}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Doctor Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Fill in the information below to create a new doctor profile
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="License Number"
              name="license_number"
              placeholder="MD123456"
              icon={Award}
              required
            />

            <InputField
              label="Phone Number"
              name="phone_number"
              type="tel"
              placeholder="+1 (555) 123-4567"
              icon={Phone}
            />

            <SelectField
              label="Gender"
              name="sex"
              options={['Male', 'Female']}
              icon={User}
              required
            />

            <InputField
              label="Years of Experience"
              name="years_of_experience"
              type="number"
              placeholder="5"
              icon={Award}
              required
            />
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Stethoscope className="w-5 h-5 mr-2" />
            Professional Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Department"
              name="department"
              options={departments}
              icon={Building}
              required
            />

            <SelectField
              label="Specialization"
              name="specialization"
              options={specializations}
              icon={Stethoscope}
            />

            <InputField
              label="Education"
              name="education"
              placeholder="MD from Harvard Medical School"
              icon={GraduationCap}
              required
            />

            <InputField
              label="Consultation Fee"
              name="consultation_fee"
              type="number"
              placeholder="250"
              icon={DollarSign}
            />
          </div>
        </div>

        {/* Contact & Location */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Contact & Location
          </h2>

          <div className="grid grid-cols-1 gap-6">
            <TextAreaField
              label="Address"
              name="address"
              placeholder="123 Medical Center Dr, Suite 200, City, State 12345"
              rows={3}
              required
            />

            <InputField
              label="Avatar URL"
              name="avatar"
              placeholder="https://example.com/avatar.jpg"
              icon={Upload}
              required
            />

            <TextAreaField
              label="Bio"
              name="bio"
              placeholder="Brief description about the doctor..."
              rows={4}
            />
          </div>
        </div>

        {/* Schedule & Availability */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Schedule & Availability
          </h2>

          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="availability"
                name="availability"
                checked={formik.values.availability}
                onChange={formik.handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="availability"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Currently Available
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Start Time"
                name="start_time"
                type="time"
                icon={Clock}
              />

              <InputField
                label="End Time"
                name="end_time"
                type="time"
                icon={Clock}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Available Days
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      formik.values.days?.includes(day)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-md font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Create Doctor</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => formik.resetForm()}
            className="flex-1 cursor-pointer sm:flex-none bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-md font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Success/Error Message */}
        {submitMessage && (
          <div
            className={`p-4 rounded-md ${
              submitMessage.includes('success')
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
            }`}
          >
            {submitMessage}
          </div>
        )}
      </form>
    </div>
  )
}