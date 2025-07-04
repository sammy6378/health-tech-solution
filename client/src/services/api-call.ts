import handleApiResponse from "./api-response"

export const baseUrl = 'https://resolveit.onrender.com/api'

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

/** Get a list of entities */
export const fetchList = async <T>(url: string): Promise<ApiResponse<T[]>> => {
  const res = await fetch(`${baseUrl}/${url}`, {
    credentials: 'include',
  })
  await handleApiResponse(res)
  return res.json()
}

/** Get a single entity by ID */
export const fetchOne = async <T>(url: string): Promise<ApiResponse<T>> => {
  const res = await fetch(`${baseUrl}/${url}`, {
    credentials: 'include',
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
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
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
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  await handleApiResponse(res)
  return res.json()
}

/** Delete an entity */
export const deleteItem = async (url: string): Promise<ApiResponse<null>> => {
  const res = await fetch(`${baseUrl}/${url}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  await handleApiResponse(res)

  // 👇 Modify this part to handle plain text too
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
