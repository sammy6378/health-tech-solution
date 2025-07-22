import type z from 'zod'
import { validateSignup } from '../utils/signupvalidate'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, X } from 'lucide-react'
import { useauthRegister } from '@/hooks/useAuthHook'
import { Role } from '@/types/Tuser'
import { toast } from 'sonner'

function CreateUser({ handleCloseModal }: { handleCloseModal: () => void }) {
  // Define the form data
  type FormData = z.infer<typeof validateSignup>
  const authRegister = useauthRegister()

  const validateField = <T,>(value: T, schema: z.ZodType<T>) => {
    const res = schema.safeParse(value)
    if (!res.success) {
      return res.error.issues[0]?.message || 'validation failed'
    }
    return undefined
  }

  const { Field, handleSubmit, Subscribe, reset } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role: Role.PATIENT,
    } as FormData,
    onSubmit: async ({ value }) => {
      const validate = validateSignup.safeParse(value)
      if (!validate.success) {
        console.error('Validation failed:', validate.error.issues)
        return
      }
      try {
        await authRegister.mutateAsync(value)
        toast.success('User created successfully!')
        reset()
        handleCloseModal() // Close modal on success
      } catch (error) {
        console.error('Registration failed:', error)
        toast.error('Registration failed. Please try again.')
      }
    },
  })

  return (
    <div className="fixed inset-0 bg-[#fafafa88] bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add User
          </h2>
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 group"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>

        {/* Form content */}
        <div className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleSubmit()
            }}
            className="space-y-4"
          >
            <Field
              name="first_name"
              validators={{
                onChange: ({ value }) =>
                  validateField(value, validateSignup.shape.first_name),
                onBlur: ({ value }) =>
                  validateField(value, validateSignup.shape.first_name),
              }}
            >
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter first name"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {field.state.meta.errors[0] && (
                    <div className="flex items-center mt-2 text-red-500 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {field.state.meta.errors[0]}
                    </div>
                  )}
                </div>
              )}
            </Field>

            <Field
              name="last_name"
              validators={{
                onChange: ({ value }) =>
                  validateField(value, validateSignup.shape.last_name),
                onBlur: ({ value }) =>
                  validateField(value, validateSignup.shape.last_name),
              }}
            >
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter last name"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {field.state.meta.errors[0] && (
                    <div className="flex items-center mt-2 text-red-500 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {field.state.meta.errors[0]}
                    </div>
                  )}
                </div>
              )}
            </Field>

            <Field
              name="email"
              validators={{
                onChange: ({ value }) =>
                  validateField(value, validateSignup.shape.email),
                onBlur: ({ value }) =>
                  validateField(value, validateSignup.shape.email),
              }}
            >
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {field.state.meta.errors[0] && (
                    <div className="flex items-center mt-2 text-red-500 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {field.state.meta.errors[0]}
                    </div>
                  )}
                </div>
              )}
            </Field>

            <Field
              name="password"
              validators={{
                onChange: ({ value }) =>
                  validateField(value, validateSignup.shape.password),
                onBlur: ({ value }) =>
                  validateField(value, validateSignup.shape.password),
              }}
            >
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {field.state.meta.errors[0] && (
                    <div className="flex items-center mt-2 text-red-500 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {field.state.meta.errors[0]}
                    </div>
                  )}
                </div>
              )}
            </Field>

            <Field
              name="role"
              validators={{
                onChange: ({ value }) =>
                  validateField(value, validateSignup.shape.role),
                onBlur: ({ value }) =>
                  validateField(value, validateSignup.shape.role),
              }}
            >
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value={Role.PATIENT}>Patient</option>
                    <option value={Role.DOCTOR}>Doctor</option>
                    <option value={Role.ADMIN}>Admin</option>
                  </select>
                  {field.state.meta.errors[0] && (
                    <div className="flex items-center mt-2 text-red-500 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {field.state.meta.errors[0]}
                    </div>
                  )}
                </div>
              )}
            </Field>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <button
                    type="submit"
                    disabled={isSubmitting || !canSubmit}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200 font-medium disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      'Create User'
                    )}
                  </button>
                )}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateUser
