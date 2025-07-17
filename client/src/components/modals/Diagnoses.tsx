import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useCreateDiagnosis } from '@/hooks/useDiagnosis'
import type { TDiagnosis } from '@/types/api-types'
import { useDropzone } from 'react-dropzone'
import { useParams } from '@tanstack/react-router'
import {
  FiUpload,
  FiFileText,
  FiCalendar,
  FiPlus,
  FiCheckCircle,
  FiX,
} from 'react-icons/fi'
import { uploadFile } from '@/hooks/useUpload'
import { getErrorMessage } from '../utils/handleError'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/store'
import { useGetAppointment } from '@/hooks/useAppointments'

const validationSchema = Yup.object({
  diagnosis_name: Yup.string().required('Required'),
  treatment_plan: Yup.string().required('Required'),
  diagnosis_date: Yup.date().required('Required'),
})

export default function DiagnosesPage() {
  const { mutate, isSuccess, isPending } = useCreateDiagnosis()
  const { appointment } = useParams({ strict: false })
  // if (!appointment) {
  //   toast.error(
  //     'Missing appointment ID. Please access this form through a valid appointment.',
  //   )
  //   return null
  // }
  const { data: appointmnet } = useGetAppointment(appointment!)
  const {user} = useAuthStore()
  const doctorId = user.userId;
  const patientId = appointmnet?.data.patient?.user_id;

  console.log('appointment', appointmnet)

  const formik = useFormik({
    initialValues: {
      diagnosis_name: '',
      treatment_plan: '',
      diagnosis_date: '',
      appointment_id: appointment,
      notes: '',
      docs: [] as File[], // ✅ Store actual File objects
      tests: [] as File[], // ✅ Store actual File objects
      allergies: '',
      symptoms: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!appointment) {
        toast.error(
          'Missing appointment ID. Please access this form through a valid appointment.',
        )
        return
      }

      if (isPending) return // prevent double-submission

      try {
        const uploadedDocs =
          values.docs.length > 0
            ? await Promise.all(values.docs.map((file) => uploadFile(file)))
            : []

        const uploadedTests =
          values.tests.length > 0
            ? await Promise.all(values.tests.map((file) => uploadFile(file)))
            : []

        const payload: TDiagnosis = {
          ...values,
          diagnosis_date: new Date(values.diagnosis_date),
          appointment_id: appointment,
          patient_id: patientId,
          doctor_id: doctorId,
          notes: values.notes
            ? values.notes.split(',').map((s) => s.trim())
            : [],
          docs: uploadedDocs,
          tests: uploadedTests,
          allergies: values.allergies
            ? values.allergies.split(',').map((s) => s.trim())
            : [],
          symptoms: values.symptoms
            ? values.symptoms.split(',').map((s) => s.trim())
            : [],
        }

        console.log('payload', payload)
        mutate(payload)
      } catch (error) {
        console.error('Upload failed:', error)
        getErrorMessage(error)
      }
    },
    enableReinitialize: true,
    validateOnMount: true,
  })

  // ✅ Fixed: Store actual File objects
  const handleDrop = (acceptedFiles: File[], field: 'docs' | 'tests') => {
    formik.setFieldValue(field, [...formik.values[field], ...acceptedFiles])
  }

  // ✅ Fixed: Remove file function
  const removeFile = (index: number, field: 'docs' | 'tests') => {
    const newFiles = formik.values[field].filter((_, i) => i !== index)
    formik.setFieldValue(field, newFiles)
  }

  const DropzoneInput = ({
    label,
    field,
  }: {
    label: string
    field: 'docs' | 'tests'
  }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => handleDrop(files, field),
      accept: {
        'application/pdf': ['.pdf'],
        'image/*': ['.png', '.jpg', '.jpeg'],
      },
      maxFiles: 5,
    })

    return (
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            <FiUpload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isDragActive ? (
                <span className="text-blue-600 dark:text-blue-400">
                  Drop files here
                </span>
              ) : (
                <>
                  Drag & drop files here, or{' '}
                  <span className="text-blue-600 dark:text-blue-400">
                    click to browse
                  </span>
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PDF, JPG, PNG (max 5 files)
            </p>
          </div>
        </div>
        {formik.values[field].length > 0 && (
          <div className="mt-3 space-y-1">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Selected files:
            </h4>
            <ul className="space-y-1">
              {formik.values[field].map((file, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded"
                >
                  <div className="flex items-center">
                    <FiFileText className="mr-2 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i, field)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            <FiPlus className="mr-2 text-blue-600" />
            New Diagnosis Record
          </h2>
          {!appointment && (
            <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-l-4 border-yellow-400 text-sm rounded">
              Warning: No appointment ID provided. Please return to the
              appointment page and try again.
            </div>
          )}

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            For Appointment ID:{' '}
            <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {appointment || 'N/A'}
            </span>
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Diagnosis Name */}
            <div>
              <label
                htmlFor="diagnosis_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Diagnosis Name *
              </label>
              <input
                id="diagnosis_name"
                name="diagnosis_name"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.diagnosis_name}
                className={`w-full px-4 py-2 rounded-lg border ${
                  formik.touched.diagnosis_name && formik.errors.diagnosis_name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                } focus:ring-2 focus:outline-none dark:bg-gray-700 dark:text-white`}
                placeholder="Enter diagnosis name"
              />
              {formik.touched.diagnosis_name &&
                formik.errors.diagnosis_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.diagnosis_name}
                  </p>
                )}
            </div>

            {/* Diagnosis Date */}
            <div>
              <label
                htmlFor="diagnosis_date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Diagnosis Date *
              </label>
              <div className="relative">
                <input
                  id="diagnosis_date"
                  name="diagnosis_date"
                  type="date"
                  onChange={formik.handleChange}
                  value={formik.values.diagnosis_date}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    formik.touched.diagnosis_date &&
                    formik.errors.diagnosis_date
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  } focus:ring-2 focus:outline-none dark:bg-gray-700 dark:text-white`}
                />
                <FiCalendar className="absolute right-3 top-2.5 text-gray-400" />
              </div>
              {formik.touched.diagnosis_date &&
                formik.errors.diagnosis_date && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.diagnosis_date}
                  </p>
                )}
            </div>

            {/* Treatment Plan */}
            <div className="md:col-span-2">
              <label
                htmlFor="treatment_plan"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Treatment Plan *
              </label>
              <textarea
                id="treatment_plan"
                name="treatment_plan"
                rows={4}
                onChange={formik.handleChange}
                value={formik.values.treatment_plan}
                className={`w-full px-4 py-2 rounded-lg border ${
                  formik.touched.treatment_plan && formik.errors.treatment_plan
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                } focus:ring-2 focus:outline-none dark:bg-gray-700 dark:text-white`}
                placeholder="Describe the treatment plan..."
              />
              {formik.touched.treatment_plan &&
                formik.errors.treatment_plan && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.treatment_plan}
                  </p>
                )}
            </div>

            {/* Symptoms */}
            <div>
              <label
                htmlFor="symptoms"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Symptoms
              </label>
              <input
                id="symptoms"
                name="symptoms"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.symptoms}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                placeholder="Comma-separated symptoms"
              />
            </div>

            {/* Allergies */}
            <div>
              <label
                htmlFor="allergies"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Allergies
              </label>
              <input
                id="allergies"
                name="allergies"
                type="text"
                onChange={formik.handleChange}
                value={formik.values.allergies}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                placeholder="Comma-separated allergies"
              />
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                onChange={formik.handleChange}
                value={formik.values.notes}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          {/* File Upload Sections */}
          <DropzoneInput label="Medical Documents" field="docs" />
          <DropzoneInput label="Test Results" field="tests" />

          {/* Form Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={isPending}
              className={`inline-flex items-center px-6 py-2.5 rounded-lg text-white font-medium cursor-pointer ${
                isPending
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              } transition-colors`}
            >
              {isPending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FiCheckCircle className="mr-2" />
                  Save Diagnosis
                </>
              )}
            </button>
          </div>

          {isSuccess && (
            <div className="p-4 mt-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
              <div className="flex items-center">
                <FiCheckCircle className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                <span>Diagnosis record saved successfully!</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
