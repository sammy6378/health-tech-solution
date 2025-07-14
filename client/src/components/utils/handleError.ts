export const getErrorMessage = (error: any): string => {
  return (
    error?.response?.response?.message || // deeply nested message
    error?.response?.message || // fallback level 1
    error?.message || // fallback plain error
    'An unknown error occurred' // final fallback
  )
}
