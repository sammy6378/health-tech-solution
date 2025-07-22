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
  Stethoscope,
  GraduationCap,
  Building,
  Award,
  Save,
  X
} from 'lucide-react'
import { useCreateDoctorProfile } from '@/hooks/useDoctorProfile'
import { toast } from 'sonner'
import { getErrorMessage } from '../utils/handleError'
import { uploadFile } from '@/hooks/useUpload'
import { Gender } from '@/types/Tuser'
import { useParams } from '@tanstack/react-router'

// Zod schema for validation
const doctorSchema = z.object({
  license_number: z.string().min(1, 'License number is required'),
  phone_number: z.string().optional(),
  specialization: z.string().optional(),
  years_of_experience: z.number().min(0, 'Years of experience must be 0 or greater'),
  education: z.string().min(1, 'Education is required'),
  department: z.string().min(1, 'Department is required'),
  availability: z.boolean(),
  sex: z.enum(Object.values(Gender) as [string, ...string[]]),
  address: z.string().min(1, 'Address is required'),
  consultation_fee: z.number().min(0, 'Consultation fee must be 0 or greater').optional(),
  days: z.array(z.string()).optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  avatar: z.string().optional(),
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
  const { mutate: createDoctorProfile } = useCreateDoctorProfile()
  const { doctorId } = useParams({strict: false})



  const handleImageUpload = async (file: File) => {
    if (file) {
      const imageUrl = await uploadFile(file);
      formik.setFieldValue('avatar', imageUrl);
    }
  }

  const formik = useFormik<DoctorFormData>({
    initialValues: {
      license_number: '',
      phone_number: '',
      specialization: '',
      years_of_experience: 0,
      education: '',
      department: '',
      availability: true,
      sex: Gender.MALE,
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
      
      try {
        createDoctorProfile({
          ...values,
          user_id: doctorId,
          sex: values.sex as Gender,
        })
        toast.success('Doctor created successfully!')
        
        // Reset form after successful submission
        formik.resetForm()
      } catch (error) {
        const msg = getErrorMessage(error)
        toast.error(msg || 'Error creating doctor. Please try again.')
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

  return (
    <div className="max-w-8xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* License Number */}
              <div>
                <label
                  htmlFor="license_number"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  License Number <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <input
                    id="license_number"
                    name="license_number"
                    type="text"
                    placeholder="MD123456"
                    className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formik.values.license_number}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                  />
                </div>
                {formik.touched.license_number &&
                  formik.errors.license_number && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.license_number}
                    </div>
                  )}
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phone_number"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Phone Number
                </label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formik.values.phone_number}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {formik.touched.phone_number && formik.errors.phone_number && (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors.phone_number}
                  </div>
                )}
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="sex"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <select
                    id="sex"
                    name="sex"
                    className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formik.values.sex}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value={Gender.MALE}>Male</option>
                    <option value={Gender.FEMALE}>Female</option>
                  </select>
                </div>
                {formik.touched.sex && formik.errors.sex && (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors.sex}
                  </div>
                )}
              </div>

              {/* Years of Experience */}
              <div>
                <label
                  htmlFor="years_of_experience"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-gray-400" />
                  <input
                    id="years_of_experience"
                    name="years_of_experience"
                    type="number"
                    min={0}
                    placeholder="5"
                    className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formik.values.years_of_experience}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                  />
                </div>
                {formik.touched.years_of_experience &&
                  formik.errors.years_of_experience && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.years_of_experience}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Stethoscope className="w-5 h-5 mr-2" />
              Professional Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department */}
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  <Building className="w-4 h-4 inline mr-1" />
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  id="department"
                  name="department"
                  className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  value={formik.values.department}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {formik.touched.department && formik.errors.department && (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors.department}
                  </div>
                )}
              </div>

              {/* Specialization */}
              <div>
                <label
                  htmlFor="specialization"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  <Stethoscope className="w-4 h-4 inline mr-1" />
                  Specialization
                </label>
                <select
                  id="specialization"
                  name="specialization"
                  className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  value={formik.values.specialization}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">Select specialization</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
                {formik.touched.specialization &&
                  formik.errors.specialization && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.specialization}
                    </div>
                  )}
              </div>

              {/* Education */}
              <div>
                <label
                  htmlFor="education"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  <GraduationCap className="w-4 h-4 inline mr-1" />
                  Education <span className="text-red-500">*</span>
                </label>
                <input
                  id="education"
                  name="education"
                  type="text"
                  placeholder="MD from Harvard Medical School"
                  className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  value={formik.values.education}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
                {formik.touched.education && formik.errors.education && (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors.education}
                  </div>
                )}
              </div>

              {/* Consultation Fee */}
              <div>
                <label
                  htmlFor="consultation_fee"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Consultation Fee
                </label>
                <input
                  id="consultation_fee"
                  name="consultation_fee"
                  type="number"
                  min={0}
                  placeholder="250"
                  className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  value={formik.values.consultation_fee ?? ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.consultation_fee &&
                  formik.errors.consultation_fee && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.consultation_fee}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Contact & Location
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="123 Medical Center Dr, Suite 200, City, State 12345"
                  className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
                {formik.touched.address && formik.errors.address && (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors.address}
                  </div>
                )}
              </div>

              {/* Avatar */}
              <div>
                <label
                  htmlFor="avatar"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Avatar <span className="text-red-500">*</span>
                </label>
                <input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  onChange={async (e) => {
                    if (e.currentTarget.files && e.currentTarget.files[0]) {
                      await handleImageUpload(e.currentTarget.files[0])
                    }
                  }}
                  required
                />
                {formik.touched.avatar && formik.errors.avatar && (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors.avatar}
                  </div>
                )}
                {formik.values.avatar && (
                  <img
                    src={formik.values.avatar}
                    alt="Avatar Preview"
                    className="mt-2 w-20 h-20 object-cover rounded-full border"
                  />
                )}
              </div>

              {/* Bio */}
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Bio
                </label>
                <input
                  id="bio"
                  name="bio"
                  type="text"
                  placeholder="Brief description about the doctor..."
                  className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  value={formik.values.bio}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.bio && formik.errors.bio && (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors.bio}
                  </div>
                )}
              </div>
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
                {/* Start Time */}
                <div>
                  <label
                    htmlFor="start_time"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    <Clock className="w-4 h-4 inline mr-1" />
                    Start Time
                  </label>
                  <input
                    id="start_time"
                    name="start_time"
                    type="time"
                    className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    value={formik.values.start_time}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.start_time && formik.errors.start_time && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.start_time}
                    </div>
                  )}
                </div>

                {/* End Time */}
                <div>
                  <label
                    htmlFor="end_time"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    <Clock className="w-4 h-4 inline mr-1" />
                    End Time
                  </label>
                  <input
                    id="end_time"
                    name="end_time"
                    type="time"
                    className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    value={formik.values.end_time}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.end_time && formik.errors.end_time && (
                    <div className="text-red-500 text-xs mt-1">
                      {formik.errors.end_time}
                    </div>
                  )}
                </div>
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
        </div>
      </form>
    </div>
  )
}