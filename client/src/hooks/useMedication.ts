import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TMedication } from '@/types/api-types'
import {
  fetchList,
  fetchOne,
  createItem,
  updateItem,
  deleteItem,
} from '@/services/api-call'

const base = 'stocks' // API base path

// ✅ Fetch all medications
export const useGetMedications = () =>
  useQuery({
    queryKey: ['medications'],
    queryFn: () => fetchList<TMedication>(base),
  })

// ✅ Fetch one medication
export const useGetMedication = (id: string) =>
  useQuery({
    queryKey: ['medication', id],
    queryFn: () => fetchOne<TMedication>(`${base}/${id}`),
    enabled: !!id,
  })

// ✅ Create a medication
export const useCreateMedication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<TMedication>) =>
      createItem<TMedication>(base, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}

// ✅ Update a medication
export const useUpdateMedication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TMedication> }) =>
      updateItem<TMedication>(`${base}/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['medications'] })
      queryClient.invalidateQueries({ queryKey: ['medication', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}

// ✅ Delete a medication
export const useDeleteMedication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteItem(`${base}/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['medications'] })
      queryClient.invalidateQueries({ queryKey: ['medication', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}
