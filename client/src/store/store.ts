import { Store } from '@tanstack/store'
import { useStore } from '@tanstack/react-store'

export interface TLoginRequest {
  email: string
  password: string
}

export interface TUser {
  user: {
    userId: string
    role: string
  }
  tokens: {
    access_token: string
    refresh_token: string
  }
  isAuthenticated: boolean
}

const initialState: TUser = {
  isAuthenticated: false,
  user: {
    userId: '',
    role: '',
  },
  tokens: {
    access_token: '',
    refresh_token: '',
  },
}


export const authStore = new Store<TUser>(initialState)

// Add this hook to subscribe to store changes
export const useAuthStore = () => {
  return useStore(authStore)
}

export const loadData = (): TUser | null => {
  try {
    const storedData = localStorage.getItem('auth')
    if (storedData) {
      const jsonData = JSON.parse(storedData)
      // Validate the data structure
      if (
        jsonData &&
        typeof jsonData === 'object' &&
        jsonData.user &&
        jsonData.tokens
      ) {
        return jsonData
      }
    }
  } catch (error) {
    console.error('Error loading auth data from localStorage:', error)
    localStorage.removeItem('auth') // Clear corrupted data
  }
  return null
}

export const authSlice = {
  login: (userData: TUser) => {
    const newState = {
      isAuthenticated: true,
      user: userData.user,
      tokens: userData.tokens,
    }

    authStore.setState(newState)
    localStorage.setItem('auth', JSON.stringify(newState))
  },

  logout: () => {
    authStore.setState(initialState)
    localStorage.removeItem('auth')
  },

  initializeUser: () => {
    const userData = loadData()
    if (userData) {
      authStore.setState({
        ...userData,
        isAuthenticated: true,
      })
      return true
    }
    return false
  },

  // Add method to check if user is authenticated
  isAuthenticated: () => {
    return authStore.state.isAuthenticated
  },

  // Add method to get current user
  getCurrentUser: () => {
    return authStore.state.user
  },
}

// Initialize on module load
authSlice.initializeUser()
