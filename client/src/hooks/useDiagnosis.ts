import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TDiagnosis } from '@/types/api-types'
import {
  fetchList,
  fetchOne,
  createItem,
  updateItem,
  deleteItem,
} from '@/services/api-call'

const base = 'diagnosis'

/** Fetch all diagnoses */
export const useGetDiagnoses = () =>
  useQuery({
    queryKey: ['diagnoses'],
    queryFn: () => fetchList<TDiagnosis>(base),
  })

/** Fetch diagnoses for a specific user (optional) */
export const useGetDiagnosesByUser = (userId: string) =>
  useQuery({
    queryKey: ['diagnoses', 'user', userId],
    queryFn: () => fetchList<TDiagnosis>(`${base}?userId=${userId}`),
    enabled: !!userId,
  })

/** Fetch a single diagnosis */
export const useGetDiagnosis = (id: string) =>
  useQuery({
    queryKey: ['diagnosis', id],
    queryFn: () => fetchOne<TDiagnosis>(`${base}/${id}`),
    enabled: !!id,
  })

/** Create a diagnosis */
export const useCreateDiagnosis = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<TDiagnosis>) =>
      createItem<TDiagnosis>(base, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnoses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}

/** Update a diagnosis */
export const useUpdateDiagnosis = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TDiagnosis> }) =>
      updateItem<TDiagnosis>(`${base}/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['diagnoses'] })
      queryClient.invalidateQueries({ queryKey: ['diagnosis', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}

/** Delete a diagnosis */
export const useDeleteDiagnosis = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteItem(`${base}/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['diagnoses'] })
      queryClient.invalidateQueries({ queryKey: ['diagnosis', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}
