import { authLogin, authSignup, type TLoginResponse } from "@/services/auth"
import { authSlice, type TLoginRequest } from "@/store/store"
import type { TRegister, TRegisterResponse } from "@/types/Tuser"
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
            return '/dashboard'
          case 'doctor':
            return '/dashboard/doctor'
          case 'patient':
            return '/dashboard/home'
          case 'pharmacy':
            return '/dashboard/pharmacy-dashboard'
          default:
            return '/dashboard/home'
        }
      }

      authSlice.login(data.data) // update store AFTER redirect path is determined
      toast.success('Login successful!')
      navigate({ to: getRedirectPath(role) })
    },
    onError: (error) => {
      console.error('Login failed:', error)
      toast.error(`Login failed: ${error.message}`)
    },
  })
}


export const useauthRegister = () => {
  const navigate = useNavigate()
    return useMutation<TRegisterResponse, Error, TRegister>({
      mutationKey: ['register'],
      mutationFn: authSignup,
      onSuccess: (data) => {
        console.log('Registration successful:', data)
        toast.success(data.message || 'Registration successful!')
        navigate({to: '/auth-signin'})
      },
      onError: (error) => {
        console.error(`Registration failed: ${error.message}`)
      }
    }
    )}