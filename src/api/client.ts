/**
 * API Client & Network Helper
 * Centralized HTTP request utility with error handling and environment-driven base URL.
 */

export const API_BASE_URL: string = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly data?: unknown;

  constructor(status: number, statusText: string, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

interface RequestOptions extends RequestInit {
  data?: unknown;
}

/**
 * Core fetch wrapper that performs the network request,
 * parses JSON bodies, checks response status, and throws structured ApiErrors.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { data, headers, ...customConfig } = options;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  const config: RequestInit = {
    ...customConfig,
    headers: requestHeaders,
    body: data !== undefined ? JSON.stringify(data) : customConfig.body,
  };

  const response = await fetch(url, config);

  // fetch() does NOT reject on HTTP 4xx / 5xx errors; we must explicitly check response.ok
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText || 'Request failed'}`;
    let errorData: unknown = undefined;

    try {
      errorData = await response.json();
      if (typeof errorData === 'object' && errorData !== null) {
        const payload = errorData as { message?: string; error?: string; errors?: string[] };
        if (payload.message) {
          errorMessage = payload.message;
        } else if (payload.error) {
          errorMessage = payload.error;
        } else if (Array.isArray(payload.errors) && payload.errors.length > 0) {
          errorMessage = payload.errors.join(', ');
        }
      }
    } catch {
      // Body was either empty or non-JSON (e.g. HTML 502/504 gateway error), preserve fallback message
    }

    throw new ApiError(response.status, response.statusText, errorMessage, errorData);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return (await response.json()) as T;
}

/**
 * Convenient HTTP method shortcuts for clean and expressive API services.
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'data' | 'method'>): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: Omit<RequestOptions, 'data' | 'method'>): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', data }),

  patch: <T>(endpoint: string, data?: unknown, options?: Omit<RequestOptions, 'data' | 'method'>): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', data }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'data' | 'method'>): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
