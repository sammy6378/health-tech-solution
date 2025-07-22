import { createItem, deleteItem, fetchList, fetchOne, updateItem, type ApiResponse } from "@/services/api-call"
import type { TDoctor } from "@/types/Tuser"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"


const base = 'doctor-profile'

// Get all doctor profiles
export const useGetDoctorProfiles = () => {
  const { data, isLoading, error } = useQuery<ApiResponse<TDoctor[]>>({
    queryKey: ['doctorProfiles'],
    queryFn: () => fetchList<TDoctor>(base),
  })

  return { doctorProfiles: data?.data || [], isLoading, error }
}


// Get a specific doctor profile by ID
export const useGetDoctorProfile = (profileId: string) => {
  const { data, isLoading, error } = useQuery<ApiResponse<TDoctor>>({
    queryKey: ['doctorProfile', profileId],
    queryFn: () => fetchOne<TDoctor>(`${base}/${profileId}`),
    enabled: !!profileId,
  })

  return { doctorProfile: data?.data, isLoading, error }
}

// get by user id
export const useGetDoctorProfileByUserId = (userId: string) => {
  const { data, isLoading, error } = useQuery<ApiResponse<TDoctor>>({
    queryKey: ['doctorProfile', 'user', userId],
    queryFn: () => fetchOne<TDoctor>(`${base}/user/${userId}`),
    enabled: !!userId,
  })

  return { doctorProfile: data?.data, isLoading, error }
}


// Create a new doctor profile
export const useCreateDoctorProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<TDoctor>) => createItem<TDoctor>(base, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorProfiles'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}

// Update an existing doctor profile
export const useUpdateDoctorProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TDoctor> }) =>
      updateItem<TDoctor>(`${base}/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['doctorProfiles'] })
      queryClient.invalidateQueries({ queryKey: ['doctorProfile', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}


// Delete a doctor profile
export const useDeleteDoctorProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteItem(`${base}/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['doctorProfiles'] })
      queryClient.invalidateQueries({ queryKey: ['doctorProfile', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })
}