import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TPatient } from '@/types/Tuser'
import {
  fetchList,
  fetchOne,
  createItem,
  updateItem,
  deleteItem,
} from '@/services/api-call'

const base = 'user-profile'

// ✅ Get all patient profiles
export const useGetPatientProfiles = () =>
  useQuery({
    queryKey: ['user-profiles'],
    queryFn: () => fetchList<TPatient>(base),
  })

// ✅ Get a single patient profile by profile ID
export const useGetPatientProfile = (id: string) =>
  useQuery({
    queryKey: ['user-profile', id],
    queryFn: () => fetchOne<TPatient>(`${base}/${id}`),
    enabled: !!id,
  })

// ✅ Get patient profile by user ID
export const useGetPatientProfileByUserId = (userId: string) =>
  useQuery({
    queryKey: ['user-profile', 'user', userId],
    queryFn: () => fetchOne<TPatient>(`${base}/profile/${userId}`),
    enabled: !!userId,
  })

// ✅ Create patient profile
export const useCreatePatientProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<TPatient>) => createItem<TPatient>(base, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profiles'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}

// ✅ Update patient profile
export const useUpdatePatientProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TPatient> }) =>
      updateItem<TPatient>(`${base}/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['user-profiles'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}

// ✅ Delete patient profile
export const useDeletePatientProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteItem(`${base}/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['user-profiles'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}
