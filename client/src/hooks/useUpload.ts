import { getErrorMessage } from '@/components/utils/handleError'
import { baseUrl } from '@/lib/baseUrl'
import { authStore } from '@/store/store'
import { toast } from 'sonner'

const base = `${baseUrl}/upload`

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(base, {
    method: 'POST',
    headers: {
      ...(authStore.state.tokens?.access_token && {
        Authorization: `Bearer ${authStore.state.tokens.access_token}`,
      }),
    },
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    const msg = getErrorMessage(errorText)
    toast.error(`Upload failed: ${msg}`)
  }

  const data = await response.json()
  return data.imageUrl
}
