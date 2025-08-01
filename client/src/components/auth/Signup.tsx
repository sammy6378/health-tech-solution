import type z from 'zod'
import { validateSignup } from '../utils/signupvalidate'
import { useForm } from '@tanstack/react-form'
import { AlertCircle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useAuthRegister } from '@/hooks/useAuthHook'
import AuthLayout from './authLayout'

function Signup() {
  type FormData = z.infer<typeof validateSignup>
  const authRegister = useAuthRegister()

  const validateField = <T,>(value: T, schema: z.ZodType<T>) => {
    const res = schema.safeParse(value)
    if (!res.success) {
      return res.error.issues[0]?.message || 'validation failed'
    }
    return undefined
  }

  const { Field, handleSubmit, Subscribe,reset } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
    } as FormData,
    onSubmit: async ({value}) => {
      const validate = validateSignup.safeParse(value)
      if (!validate.success) {
        console.error('Validation failed:', validate.error.issues)
        return
      }
     try {
      // If value.role exists, cast or map it to the correct Role type
      const roleValue = value.role as (typeof authRegister.variables extends { role: infer R } ? R : undefined) | undefined;
      await authRegister.mutateAsync({ ...value, role: roleValue })
      reset() // Reset the form after successful registration
     } catch (error) {
      console.error('Registration failed:', error)
     }
    },
  })

  return (
    <AuthLayout>
      <div className="w-full md:w-1/2 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sign Up
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleSubmit()
            }}
            className="space-y-3 w-full"
          >
            <div className="flex flex-col md:flex-row gap-4">
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
                      placeholder="Enter your first name"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      placeholder="Enter your last name"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            </div>
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
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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

            <Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={isSubmitting || !canSubmit}
                  className="w-full mt-4 px-4 py-3 cursor-pointer bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating account...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              )}
            />

            <div className="text-center pt-4 border-t border-gray-200 dark:border-white/10">
              <p className="text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <Link
                  to="/auth-signin"
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-semibold transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  )
}

export default Signup
