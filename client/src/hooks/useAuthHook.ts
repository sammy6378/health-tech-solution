import { getErrorMessage } from "@/components/utils/handleError"
import { baseUrl } from "@/lib/baseUrl"
import { authLogin, authSignup, resetEmail, type TLoginResponse, type TResetEmailResponse } from "@/services/auth"
import { authSlice, type TLoginRequest } from "@/store/store"
import type { TRegister } from "@/types/Tuser"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"


export const useLogin = () => {
  const navigate = useNavigate()

  return useMutation<TLoginResponse, Error, TLoginRequest>({
    mutationKey: ['login'],
    mutationFn: authLogin,
    onSuccess: (data) => {
      const user = data.data.user 
      const role = user?.role ?? ''

      const getRedirectPath = (role: string) => {
        switch (role) {
          case 'admin':
            return '/dashboard/admin'
          case 'doctor':
            return '/dashboard/doctor'
          case 'patient':
            return '/dashboard/home'
          default:
            return '/dashboard/home'
        }
      }

      authSlice.login(data.data) // update store AFTER redirect path is determined
      toast.success('Login successful!')
      navigate({ to: getRedirectPath(role) })
    },
    onError: (error) => {
      const errormessage = getErrorMessage(error)
      console.error(`Login failed: ${errormessage}`)
      toast.error(`Login failed: ${errormessage}`)
    },
  })
}


export const useAuthRegister = () => {
  const navigate = useNavigate()
    return useMutation<TLoginResponse, Error, TRegister>({
      mutationKey: ['register'],
      mutationFn: authSignup,
      onSuccess: (data) => {
        const user = data.data.user;
        const role = user?.role ?? '';

        const getRedirectPath = (role: string) => {
          switch (role) {
            case 'admin':
              return '/dashboard/admin'
            case 'doctor':
              return '/dashboard/doctor'
            case 'patient':
              return '/dashboard/home'
            default:
              return '/dashboard/home'
          }
        }
        toast.success(data.message || 'Registration successful!')
        if (data.success) {
          authSlice.login(data.data)
          navigate({ to: getRedirectPath(role) })
        }
      },
      onError: (error) => {
        console.error(`Registration failed: ${error.message}`)
        const errormessage = getErrorMessage(error)
        toast.error(`Registration failed: ${errormessage}`)
      },
    })}


    // reset email
export const useResetEmail = () => {
  return useMutation<TResetEmailResponse, Error, { email: string }>({
    mutationKey: ['resetEmail'],
    mutationFn: ({ email }) => resetEmail(email),
    onSuccess: () => {
      toast.success('Reset email sent successfully!')
    },
    onError: (error) => {
      const errormessage = getErrorMessage(error)
      console.error(`Reset email failed: ${errormessage}`)
      toast.error(`Reset email failed: ${errormessage}`)
    },
  })
}


export const useResetPassword = () => {
  const navigate = useNavigate()
  return useMutation<{ message: string }, Error, { token: string; newPassword: string }>({
    mutationKey: ['resetPassword'],
    mutationFn: async ({ token, newPassword }) => {
      const response = await fetch(`${baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      })

      if (!response.ok) {
        throw new Error('Failed to reset password')
      }

      return response.json()
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Password reset successful!')
      navigate({ to: '/auth-signin' })
    },
    onError: (error) => {
      const errormessage = getErrorMessage(error)
      console.error(`Reset password failed: ${errormessage}`)
      toast.error(`Reset password failed: ${errormessage}`)
    },
  })
}