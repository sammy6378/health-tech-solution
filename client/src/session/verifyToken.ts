import { getNewToken } from '@/services/auth'
import { authSlice, authStore } from '@/store/store'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  exp: number // Expiration time
  [key: string]: any // Other properties
}

const checkTokenExpiration = (token: string) => {
  try {
    const decode = jwtDecode<JwtPayload>(token)
    const currentTime = Math.floor(Date.now() / 1000) // Current time in seconds
    return decode.exp < currentTime // Check if the token is expired
  } catch (error) {
    return true
  }
}

export const verifyToken = async (token: string) => {
  const tokens = authStore.state.tokens
  if (!tokens.access_token || !tokens.refresh_token) {
    authSlice.logout()
    return null
  }

  const isTokenExpired = checkTokenExpiration(token)
  if (!isTokenExpired) {
    return tokens.access_token
  }

  try {
    const newToken = await getNewToken()

    authStore.state.tokens.access_token = newToken
    return newToken
  } catch (error) {
    authSlice.logout()
    console.error('Error refreshing token:', error)
  }
}
