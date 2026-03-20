import type { ListUsersResponse, UserDetail } from '@/types/user';

import { apiFetch } from '@/api/client';

interface ListUsersParams {
  page: number;
  limit: number;
  search?: string;
}

export function listUsers(params: ListUsersParams): Promise<ListUsersResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.search) {
    query.set('search', params.search);
  }

  return apiFetch<ListUsersResponse>(`/api/v1/admin/users?${query}`);
}

export function getUserDetail(id: string): Promise<UserDetail> {
  return apiFetch<UserDetail>(
    `/api/v1/admin/users/${encodeURIComponent(id)}`,
  );
}
