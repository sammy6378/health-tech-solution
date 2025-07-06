import { baseUrl } from '@/lib/baseUrl'
import handleApiResponse from './api-response'
import { authStore } from '@/store/store'

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

/** Get authorization headers */
const getAuthHeaders = (): HeadersInit => {
  const token = authStore.state.tokens?.access_token
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

/** Get a list of entities */
export const fetchList = async <T>(url: string): Promise<ApiResponse<T[]>> => {
  const res = await fetch(`${baseUrl}/${url}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  await handleApiResponse(res)
  return res.json()
}

/** Get a single entity by ID */
export const fetchOne = async <T>(url: string): Promise<ApiResponse<T>> => {
  const res = await fetch(`${baseUrl}/${url}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  await handleApiResponse(res)
  return res.json()
}

/** Create a new entity */
export const createItem = async <T, D = Partial<T>>(
  url: string,
  payload: D,
): Promise<ApiResponse<T>> => {
  const res = await fetch(`${baseUrl}/${url}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  await handleApiResponse(res)
  return res.json()
}

/** Update an existing entity */
export const updateItem = async <T, D = Partial<T>>(
  url: string,
  payload: D,
): Promise<ApiResponse<T>> => {
  const res = await fetch(`${baseUrl}/${url}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  await handleApiResponse(res)
  return res.json()
}

/** Delete an entity */
export const deleteItem = async (url: string): Promise<ApiResponse<null>> => {
  const res = await fetch(`${baseUrl}/${url}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  await handleApiResponse(res)

  // Handle both JSON and text responses
  const contentType = res.headers.get('content-type')
  const data = contentType?.includes('application/json')
    ? await res.json()
    : {
        success: true,
        message: await res.text(),
        data: null,
      }

  return data
}

/** Public endpoints (no auth required) */
export const fetchPublic = async <T>(url: string): Promise<ApiResponse<T>> => {
  const res = await fetch(`${baseUrl}/${url}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  await handleApiResponse(res)
  return res.json()
}

/** Auth endpoints (login, register, etc.) */
export const authRequest = async <T, D = any>(
  url: string,
  payload: D,
  method: 'POST' | 'PUT' | 'PATCH' = 'POST',
): Promise<ApiResponse<T>> => {
  const res = await fetch(`${baseUrl}/${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  await handleApiResponse(res)
  return res.json()
}
