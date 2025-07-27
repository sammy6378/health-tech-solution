import { createContext, useContext, useState, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'

interface IContext {
  activationToken: string | null
  setActivationToken: Dispatch<SetStateAction<string | null>>
}

export const AppContext = createContext<IContext | undefined>(undefined)

export default function ProviderFunction({
  children,
}: {
  children: React.ReactNode
}) {
  const [activationToken, setActivationTokenState] = useState<string | null>(
    null,
  )

  // Load activation token from sessionStorage on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem('activation_token')
    if (savedToken) {
      setActivationTokenState(savedToken)
    }
  }, [])

  // Custom setter that also saves to sessionStorage
  const setActivationToken: Dispatch<SetStateAction<string | null>> = (
    value,
  ) => {
    setActivationTokenState((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value

      if (newValue) {
        sessionStorage.setItem('activation_token', newValue)
      } else {
        sessionStorage.removeItem('activation_token')
      }

      return newValue
    })
  }

  return (
    <AppContext.Provider
      value={{
        activationToken,
        setActivationToken,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useContextFunc = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error(
      'Context not found. Make sure to wrap your app with ProviderFunction.',
    )
  return context
}
