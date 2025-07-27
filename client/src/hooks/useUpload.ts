import { getErrorMessage } from '@/components/utils/handleError'
import { baseUrl } from '@/lib/baseUrl'
import { authStore } from '@/store/store'
import { useToast } from './use-toast'

const base = `${baseUrl}/upload`

export const uploadFile = async (file: File): Promise<string> => {
  const { toast } = useToast()

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
    toast({
      title: 'Upload failed',
      description: msg,
      variant: 'destructive',
    })
  }

  const data = await response.json()
  return data.imageUrl
}
