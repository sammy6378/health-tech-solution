import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TMedicalrecord } from '@/types/api-types'
import {
  fetchList,
  fetchOne,
  createItem,
  updateItem,
  deleteItem,
} from '@/services/api-call'

const base = 'medical-records'

// ✅ Get all medical records
export const useGetMedicalRecords = () =>
  useQuery({
    queryKey: ['medical-records'],
    queryFn: () => fetchList<TMedicalrecord>(base),
  })

// ✅ Get a single medical record by record ID
export const useGetMedicalRecord = (id: string) =>
  useQuery({
    queryKey: ['medical-record', id],
    queryFn: () => fetchOne<TMedicalrecord>(`${base}/${id}`),
    enabled: !!id,
  })

// ✅ Get a patient's medical record by userId
export const useFetchMedicalRecordByUser = (userId: string) =>
  useQuery({
    queryKey: ['medical-record', 'patient', userId],
    queryFn: () => fetchOne<TMedicalrecord>(`${base}/patient/${userId}`),
    enabled: !!userId,
  })

// ✅ Create a medical record
export const useCreateMedicalRecord = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<TMedicalrecord>) =>
      createItem<TMedicalrecord>(base, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}

// ✅ Update a medical record
export const useUpdateMedicalRecord = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TMedicalrecord> }) =>
      updateItem<TMedicalrecord>(`${base}/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] })
      queryClient.invalidateQueries({ queryKey: ['medical-record', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}

// ✅ Delete a medical record
export const useDeleteMedicalRecord = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteItem(`${base}/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] })
      queryClient.invalidateQueries({ queryKey: ['medical-record', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}
