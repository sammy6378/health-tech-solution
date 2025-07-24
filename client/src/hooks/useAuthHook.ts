import { getErrorMessage } from "@/components/utils/handleError"
import { useToast } from '@/hooks/use-toast'
import { baseUrl } from "@/lib/baseUrl"
import { authLogin, authSignup, resetEmail, type TLoginResponse, type TResetEmailResponse } from "@/services/auth"
import { authSlice, type TLoginRequest } from "@/store/store"
import type { TRegister } from "@/types/Tuser"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"


export const useLogin = () => {
  const navigate = useNavigate()
 const { toast } = useToast()

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
      toast({
        title: 'Login successful',
        description: data.message || 'Welcome back!',
        variant: 'default',
      })
      navigate({ to: getRedirectPath(role) })
    },
    onError: (error) => {
      const errormessage = getErrorMessage(error)
      console.error(`Login failed: ${errormessage}`)
      toast({
        title: 'Login failed',
        description: errormessage,
        variant: 'destructive',
      })
    },
  })
}


export const useAuthRegister = () => {
  const navigate = useNavigate()
   const { toast } = useToast()
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
        toast({
          title: 'Registration successful',
          description: data.message || 'Welcome aboard!',
          variant: 'default',
        })
        if (data.success) {
          authSlice.login(data.data)
          navigate({ to: getRedirectPath(role) })
        }
      },
      onError: (error) => {
        console.error(`Registration failed: ${error.message}`)
        const errormessage = getErrorMessage(error)
        toast({
          title: 'Registration failed',
          description: errormessage,
          variant: 'destructive',
        })
      },
    })}


    // reset email
export const useResetEmail = () => {
    const { toast } = useToast()
  return useMutation<TResetEmailResponse, Error, { email: string }>({
    mutationKey: ['resetEmail'],
    mutationFn: ({ email }) => resetEmail(email),
    onSuccess: () => {
      toast({
        title: 'Reset email sent successfully!',
        variant: 'default',
      })
    },
    onError: (error) => {
      const errormessage = getErrorMessage(error)
      console.error(`Reset email failed: ${errormessage}`)
      toast({
        title: 'Reset email failed',
        description: errormessage,
        variant: 'destructive',
      })
    },
  })
}


export const useResetPassword = () => {
    const { toast } = useToast()
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
      toast({
        title: 'Password reset successful!',
        description: data.message || 'You can now log in with your new password.',
        variant: 'default',
      })
      navigate({ to: '/auth-signin' })
    },
    onError: (error) => {
      const errormessage = getErrorMessage(error)
      console.error(`Reset password failed: ${errormessage}`)
      toast({
        title: 'Reset password failed',
        description: errormessage,
        variant: 'destructive',
      })
    },
  })
}