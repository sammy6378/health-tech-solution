import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchList,
  fetchOne,
  createItem,
  updateItem,
  deleteItem,
} from '@/services/api-call'
import type { TUser } from '@/types/Tuser'
import type { ApiResponse } from '@/services/api-call'
import { useAuthStore } from '@/store/store'
import type { Dashboard } from './useDashboard'

const base = 'users'

// Get all users
export const useUsers = () => {
  const { data, isLoading, error } = useQuery<ApiResponse<TUser[]>>({
    queryKey: ['users'],
    queryFn: () => fetchList<TUser>(base),
  })

  return { users: data?.data || [], isLoading, error }
}

// Get single user
export const useUser = (userId: string) => {
  const { data, isLoading, error } = useQuery<ApiResponse<TUser>>({
    queryKey: ['user', userId],
    queryFn: () => fetchOne<TUser>(`${base}/${userId}`),
    enabled: !!userId,
  })

  return { user: data?.data, isLoading, error }
}


// dahboard data
export const useDashboardData = () => {
  const { user } = useAuthStore()
  const userId = user?.userId || ''

  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dashboard', userId],
    queryFn: () => fetchOne<Dashboard>(`users/${userId}/dashboard`),
    enabled: !!userId,
  })

  return {
    user,
    data: res?.data || null,
    isLoading,
    error,
  }
}


// all doctors
export const useGetDoctors = () => {
  const { data, isLoading, error } = useQuery<ApiResponse<TUser[]>>({
    queryKey: ['doctors'],
    queryFn: () => fetchList<TUser>(`${base}/doctors`),
  })

  return { data, isLoading, error }
}



// Create user
export const useCreateUser = () => {
  const queryClient = useQueryClient()
  const { mutate, isPending, error } = useMutation({
    mutationFn: (payload: Partial<TUser>) => createItem<TUser>(base, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })

  return { createUser: mutate, isPending, error }
}

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TUser> }) =>
      updateItem<TUser>(`${base}/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })

  return { updateUser: mutate, isPending, error }
}

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  const { mutate, isPending, error } = useMutation({
    mutationFn: (id: string) => deleteItem(`${base}/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'], exact: false })
    },
  })

  return { deleteUser: mutate, isPending, error }
}
