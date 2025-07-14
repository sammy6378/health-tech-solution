import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TOrder } from '@/types/api-types'
import {
  fetchList,
  fetchOne,
  createItem,
  updateItem,
  deleteItem,
} from '@/services/api-call'

const base = 'orders'

// ✅ Get all orders
export const useGetOrders = () =>
  useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchList<TOrder>(base),
  })

// ✅ Get a specific order by ID
export const useGetOrder = (id: string) =>
  useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOne<TOrder>(`${base}/${id}`),
    enabled: !!id,
  })

// ✅ Create a new order
export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<TOrder>) => createItem<TOrder>(base, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}

// ✅ Update an existing order
export const useUpdateOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TOrder> }) =>
      updateItem<TOrder>(`${base}/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}

// ✅ Delete an order
export const useDeleteOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteItem(`${base}/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}
