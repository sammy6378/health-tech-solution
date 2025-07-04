import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import {
  fetchList,
  fetchOne,
  createItem,
  updateItem,
  deleteItem,
} from '@/services/api-call'

import type { ApiResponse } from '@/services/api-call'

//   Fetch a list of items
export const useGetList = <T>(
  key: string,
  url: string,
): UseQueryResult<ApiResponse<T[]>, Error> => {
  return useQuery({
    queryKey: [key],
    queryFn: () => fetchList<T>(url),
    // staleTime: 1000,
  })
}

/**
 * Fetch a single item by ID
 */
export const useGetOne = <T>(
  key: string,
  url: string,
  enabled: boolean = true,
): UseQueryResult<ApiResponse<T>, Error> => {
  return useQuery({
    queryKey: [key, url],
    queryFn: () => fetchOne<T>(url),
    enabled,
    // staleTime: 1000,
  })
}

/**
 * Create a new item [optimistic update]
 */
export const useCreate = <T, D = Partial<T>>(
  key: string,
  url: string,
): UseMutationResult<ApiResponse<T>, Error, D> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: D) => createItem<T, D>(url, data),

    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: [key] })
      const previous = queryClient.getQueryData<ApiResponse<T[]>>([key])

      queryClient.setQueryData<ApiResponse<T[]>>([key], (old) => {
        if (!old) return old
        const tempItem = {
          ...newItem,
          _id: `temp-${Date.now()}`,
        } as T

        return {
          ...old,
          data: [tempItem, ...old.data],
        }
      })

      return { previous }
    },

    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData([key], context.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [key] })
    },
  })
}

/**
 * Update an item by ID [optimistic update]
 */
export const useUpdate = <T, D = Partial<T>>(
  key: string,
  urlFn: (id: string) => string,
): UseMutationResult<ApiResponse<T>, Error, { id: string; data: D }> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateItem<T, D>(urlFn(id), data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [key] })
      const previous = queryClient.getQueryData<ApiResponse<T[]>>([key])

      queryClient.setQueryData<ApiResponse<T[]>>([key], (old) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((item: any) =>
            item._id === id ? { ...item, ...data } : item,
          ),
        }
      })

      return { previous }
    },

    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData([key], context.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [key] })
    },
  })
}
  

/**
 * Delete an item by ID [optimistic update]
 */
export const useDelete = (
  key: string,
  urlFn: (id: string) => string,
): UseMutationResult<ApiResponse<null>, Error, string> => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteItem(urlFn(id)),

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: [key] })
      const previous = queryClient.getQueryData<ApiResponse<any[]>>([key])

      queryClient.setQueryData<ApiResponse<any[]>>([key], (old) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.filter((item) => item._id !== id),
        }
      })

      return { previous }
    },

    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData([key], context.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [key] })
    },
  })
}
  
