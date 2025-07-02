// utils/response.util.ts

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export function createResponse<T>(
  data: T,
  message = 'Success',
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}
