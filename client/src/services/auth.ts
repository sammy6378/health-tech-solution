import handleApiResponse from '@/services/api-response'
import { baseUrl } from '@/lib/baseUrl'
import {
  authSlice,
  authStore,
  type TLoginRequest,
  type TUser,
} from '@/store/store'
import type { TRegister } from '@/types/Tuser'
import { useNavigate } from '@tanstack/react-router'

export interface TLoginResponse {
  success: boolean
  message: string
  data: TUser
}

// register
export const authSignup = async (data: TRegister) => {
  try {
    const res = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    await handleApiResponse(res) // This will throw if not ok
    const resp = await res.json()
    return resp
  } catch (error: any) {
    throw error
  }
}

// login
export const authLogin = async (data: TLoginRequest) => {
  try {
    const res = await fetch(`${baseUrl}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    await handleApiResponse(res)
    const resp = await res.json()
    return resp
  } catch (error: any) {
    throw error
  }
}

// get new token
export const getNewToken = async () => {
  const refreshToken = authStore.state.tokens.refresh_token
  const id = authStore.state.user.userId
  if (!refreshToken || !id) {
    throw new Error('No refresh token or user ID found')
  }

  try {
    const res = await fetch(`${baseUrl}/auth/refresh/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    })

    await handleApiResponse(res)
    const resp = await res.json()
    return resp.data
  } catch (error: any) {
    throw error
  }
}

// log out
export const authLogout = async () => {
  const navigate = useNavigate()
  try {
    const res = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    await handleApiResponse(res)
    authSlice.logout()
    // redirect to login page
    navigate({ to: '/auth-signin', replace: true })
    return { success: true, message: 'Logged out successfully' }
  } catch (error: any) {
    // Still logout locally even if server request fails
    authSlice.logout()
    throw error
  }
}
