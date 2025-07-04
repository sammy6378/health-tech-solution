import { authLogin, authSignup, type TLoginResponse } from "@/services/auth"
import { authSlice, type TLoginRequest } from "@/store/store"
import type { TRegister, TRegisterResponse } from "@/types/Tuser"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"


// use login hook
export const useLogin = () =>{
    return useMutation<TLoginResponse,Error,TLoginRequest>({
        mutationKey: ['login'],
        mutationFn: authLogin,
        onSuccess: (data) => {
            authSlice.login(data.data)
            toast.success('Login successful!')
        },
        onError: (error) => {
            console.error('Login failed:', error)
            toast.error(`Login failed: ${error.message}`)
        }
    })
}


export const useauthRegister = () => {
    return useMutation<TRegisterResponse, Error, TRegister>({
      mutationKey: ['register'],
      mutationFn: authSignup,
      onSuccess: (data) => {
        console.log('Registration successful:', data)
        toast.success(data.message || 'Registration successful!')
      },
      onError: (error) => {
        console.error(`Registration failed: ${error.message}`)
      }
    }
    )}