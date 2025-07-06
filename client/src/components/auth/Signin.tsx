
import type z from 'zod'
import { validateSignin } from '../utils/signupvalidate'
import { useForm } from '@tanstack/react-form'
import { AlertCircle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useLogin } from '@/hooks/useAuthHook'
import AuthLayout from './authLayout'

function Signin() {
  type FormData = z.infer<typeof validateSignin>
  const authLogin = useLogin()

  const validateField = <T,>(value: T, schema: z.ZodType<T>) => {
    const res = schema.safeParse(value)
    if (!res.success) {
      return res.error.issues[0]?.message || 'validation failed'
    }
    return undefined
  }

  const { Field, handleSubmit, Subscribe } = useForm({
    defaultValues: {
      email: '',
      password: '',
    } as FormData,
    onSubmit: async ({value}) => {
      const validate = validateSignin.safeParse(value)
      if (!validate.success) {
        console.error('Validation failed:', validate.error.issues)
        return
      }
      await authLogin.mutateAsync(value)
    },
  })

  return (
    <AuthLayout>
      <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg mt-18">
        <h2 className="text-2xl font-bold text-white mb-4">Sign Up</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleSubmit()
          }}
          className="space-y-3 w-full"
        >
          <Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                validateField(value, validateSignin.shape.email),
              onBlur: ({ value }) =>
                validateField(value, validateSignin.shape.email),
            }}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {field.state.meta.errors[0] && (
                  <div className="flex items-center mt-2 text-red-400 text-sm">
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
                validateField(value, validateSignin.shape.password),
              onBlur: ({ value }) =>
                validateField(value, validateSignin.shape.password),
            }}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {field.state.meta.errors[0] && (
                  <div className="flex items-center mt-2 text-red-400 text-sm">
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
                className="w-full mt-4 px-4 py-3 bg-blue-700 text-white cursor-pointer rounded-lg hover:bg-blue-800 transition-colors duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            )}
          />

          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-gray-300">
              Don't have an account?{' '}
              <Link
                to="/auth-signup"
                className="text-purple-400 cursor-pointer hover:text-purple-300 font-semibold transition-colors"
              >
                Sign Up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}

export default Signin
