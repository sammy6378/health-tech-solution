import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TPrescription } from '@/types/api-types'
import {
  fetchList,
  fetchOne,
  createItem,
  updateItem,
  deleteItem,
} from '@/services/api-call'

const base = 'prescriptions'

// ✅ Get all prescriptions
export const useGetPrescriptions = () =>
  useQuery({
    queryKey: ['prescriptions'],
    queryFn: () => fetchList<TPrescription>(base),
  })

// ✅ Get prescriptions for a specific patient
export const useGetPrescriptionsByPatient = (patientId: string) =>
  useQuery({
    queryKey: ['prescriptions', 'patient', patientId],
    queryFn: () => fetchList<TPrescription>(`${base}/patient/${patientId}`),
    enabled: !!patientId,
  })

// ✅ Get a specific prescription
export const useGetPrescription = (id: string) =>
  useQuery({
    queryKey: ['prescription', id],
    queryFn: () => fetchOne<TPrescription>(`${base}/${id}`),
    enabled: !!id,
  })

// ✅ Create a prescription
export const useCreatePrescription = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<TPrescription>) =>
      createItem<TPrescription>(base, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}

// ✅ Update a prescription
export const useUpdatePrescription = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TPrescription> }) =>
      updateItem<TPrescription>(`${base}/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
      queryClient.invalidateQueries({ queryKey: ['prescription', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}

// ✅ Delete a prescription
export const useDeletePrescription = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteItem(`${base}/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
      queryClient.invalidateQueries({ queryKey: ['prescription', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}
