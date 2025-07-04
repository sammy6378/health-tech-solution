const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData: any = {
      statusCode: response.status,
      timestamp: new Date().toISOString(),
      path: new URL(response.url).pathname,
    }

    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const jsonError = await response.json()
        // Preserve the full error structure from your API
        errorData = {
          ...errorData,
          response: jsonError,
          message: jsonError.message,
          error: jsonError.error,
        }
      } else {
        const errorText = await response.text()
        errorData.message =
          errorText ||
          `Request failed with status ${response.status}: ${response.statusText}`
      }
    } catch (error) {
      console.warn('Failed to parse error response', error)
      errorData.message = `Request failed with status ${response.status}: ${response.statusText}`
    }

    // Create an error that matches your API error structure
    const apiError = new Error(
      Array.isArray(errorData.message)
        ? errorData.message.join(', ')
        : errorData.message,
    )
    // Attach the full error data to the error object
    ;(apiError as any).response = errorData.response
    ;(apiError as any).statusCode = errorData.statusCode
    ;(apiError as any).timestamp = errorData.timestamp
    ;(apiError as any).path = errorData.path

    throw apiError
  }
  return response
}

export default handleApiResponse
