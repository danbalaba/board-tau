export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
    totalPages?: number;
    stats?: Record<string, any>;
  };
}

export class ApiResponseFormatter {
  static success<T = any>(
    data?: T,
    message?: string,
    meta?: ApiResponse['meta']
  ): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      meta,
    };
  }

  static error(
    error: string,
    message?: string,
    details?: any
  ): ApiResponse {
    return {
      success: false,
      error,
      message,
      details,
    };
  }
}

export function formatApiResponse<T = any>(
  data?: T,
  message?: string,
  meta?: ApiResponse['meta']
): ApiResponse<T> {
  return ApiResponseFormatter.success(data, message, meta);
}

export function formatApiError(
  error: string,
  message?: string,
  details?: any
): ApiResponse {
  return ApiResponseFormatter.error(error, message, details);
}
