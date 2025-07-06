import { authLogin, authSignup, type TLoginResponse } from "@/services/auth"
import { authSlice, type TLoginRequest } from "@/store/store"
import type { TRegister, TRegisterResponse } from "@/types/Tuser"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"


// use login hook
export const useLogin = () =>{
  const navigate = useNavigate()
    return useMutation<TLoginResponse,Error,TLoginRequest>({
        mutationKey: ['login'],
        mutationFn: authLogin,
        onSuccess: (data) => {
            authSlice.login(data.data)
            toast.success('Login successful!')
            navigate({to: '/dashboard/home'})
        },
        onError: (error) => {
            console.error('Login failed:', error)
            toast.error(`Login failed: ${error.message}`)
        }
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