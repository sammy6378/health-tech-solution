import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TPayment } from '@/types/api-types'
import {
  fetchList,
  fetchOne,
  createItem,
  updateItem,
  deleteItem,
} from '@/services/api-call'
import { toast } from 'sonner'
import { getErrorMessage } from '@/components/utils/handleError'

const base = 'payments'

// ✅ Get all payments
export const useGetPayments = () =>
  useQuery({
    queryKey: ['payments'],
    queryFn: () => fetchList<TPayment>(base),
  })

// ✅ Get a payment by ID
export const useGetPayment = (id: string) =>
  useQuery({
    queryKey: ['payment', id],
    queryFn: () => fetchOne<TPayment>(`${base}/${id}`),
    enabled: !!id,
  })

// ✅ Get all payments made by a specific user
export const useGetPaymentsByUser = (userId: string) =>
  useQuery({
    queryKey: ['payments', 'user', userId],
    queryFn: () => fetchList<TPayment>(`${base}/user/${userId}`),
    enabled: !!userId,
  })

// ✅ Create a payment
export const useCreatePayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<TPayment>) => createItem<TPayment>(base, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
    onError: (error: any) => {
      const msg = getErrorMessage(error)
      toast.error(msg || 'Failed to initiate payment')
    }
  })
}

// verify payment
export const useVerifyPayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reference }: { reference: string }) =>
      fetchOne<TPayment>(`${base}/verify/${reference}`),
    onSuccess: (_, { reference }) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['payment', reference] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
      toast.success('Payment verified successfully')
    },
    onError: (error: any) => {
      console.error('Payment verification error:', error)
      const msg = getErrorMessage(error)
      toast.error(
        msg || 'Failed to verify payment',
      )
    }
  })
}


// ✅ Update a payment
export const useUpdatePayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TPayment> }) =>
      updateItem<TPayment>(`${base}/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['payment', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}

// ✅ Delete a payment
export const useDeletePayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteItem(`${base}/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['payment', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}
