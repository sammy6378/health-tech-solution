import type z from 'zod'
import { validateResetPassword } from '../utils/signupvalidate'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Link, useSearch } from '@tanstack/react-router'
import { useResetPassword } from '@/hooks/useAuthHook'
import AuthLayout from './authLayout'
import { useState } from 'react'

function ResetPassword() {
  type FormData = z.infer<typeof validateResetPassword>
  const authResetPassword = useResetPassword()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Get token from search params
  const { token } = useSearch({ from: '/(auth)/auth-reset-password' })

  const validateField = <T,>(value: T, schema: z.ZodType<T>) => {
    const res = schema.safeParse(value)
    if (!res.success) {
      return res.error.issues[0]?.message || 'validation failed'
    }
    return undefined
  }

  const { Field, handleSubmit, Subscribe } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    } as FormData,
    onSubmit: async ({ value }) => {
      const validate = validateResetPassword.safeParse(value)
      if (!validate.success) {
        console.error('Validation failed:', validate.error.issues)
        return
      }

      if (!token) {
        console.error('No token provided')
        return
      }

      await authResetPassword.mutateAsync({
        token,
        newPassword: value.password,
      })
    },
  })

  // Show error if no token is provided
  if (!token) {
    return (
      <AuthLayout>
        <div className="w-full md:w-1/2 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Invalid Reset Link
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This password reset link is invalid or has expired.
              </p>
              <Link
                to="/auth-reset-email"
                className="inline-block px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="w-full md:w-1/2 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Reset Password
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Enter your new password below.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleSubmit()
            }}
            className="space-y-4 w-full"
          >
            <Field
              name="password"
              validators={{
                onChange: ({ value }) =>
                  validateField(
                    value,
                    (validateResetPassword.innerType() as z.ZodObject<any>)
                      .shape.password,
                  ),
                onBlur: ({ value }) =>
                  validateField(
                    value,
                    (validateResetPassword.innerType() as z.ZodObject<any>)
                      .shape.password,
                  ),
              }}
            >
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Enter your new password"
                      className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
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
              name="confirmPassword"
              validators={{
                onChange: ({ value, fieldApi }) => {
                  const formData = {
                    password: fieldApi.form.getFieldValue('password'),
                    confirmPassword: value,
                  }
                  return validateField(formData, validateResetPassword)
                },
                onBlur: ({ value, fieldApi }) => {
                  const formData = {
                    password: fieldApi.form.getFieldValue('password'),
                    confirmPassword: value,
                  }
                  return validateField(formData, validateResetPassword)
                },
              }}
            >
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Confirm your new password"
                      className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
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
                  className="w-full mt-6 px-4 py-3 bg-blue-700 text-white cursor-pointer rounded-lg hover:bg-blue-800 transition-colors duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              )}
            />

            <div className="text-center pt-4 border-t border-gray-200 dark:border-white/10">
              <p className="text-gray-600 dark:text-gray-300">
                Remembered your password?{' '}
                <Link
                  to="/auth-signin"
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-semibold transition-colors"
                >
                  Sign In here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  )
}

export default ResetPassword
