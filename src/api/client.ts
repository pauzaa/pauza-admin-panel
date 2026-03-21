import type { ApiErrorBody } from '@/types/api';

export class ApiError extends Error {
  name = 'ApiError' as const;
  constructor(
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

let isRedirecting = false;

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
  const url = baseUrl + path;

  const token = localStorage.getItem('admin_token');

  const headers: Record<string, string> = {
    ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options?.headers as Record<string, string> | undefined),
      },
    });
  } catch {
    throw new ApiError(
      'NETWORK_ERROR',
      'Unable to reach the server. Check your connection.',
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      if (!isRedirecting) {
        isRedirecting = true;
        window.location.href = '/login';
      }
    }

    let body: ApiErrorBody | undefined;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      // JSON parse failed — fall through
    }

    throw new ApiError(
      body?.error.code ?? 'UNKNOWN_ERROR',
      body?.error.message ?? response.statusText,
      body?.error.details?.fields,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
