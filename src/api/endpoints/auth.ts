import type { AdminLoginResponse } from '@/types/auth';

import { apiFetch } from '@/api/client';

export function login(
  username: string,
  password: string,
): Promise<AdminLoginResponse> {
  return apiFetch<AdminLoginResponse>('/api/v1/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}
