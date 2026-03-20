import type {
  ListEntitlementsResponse,
  ManageEntitlementRequest,
  ManageEntitlementResponse,
} from '@/types/entitlement';

import { apiFetch } from '@/api/client';

interface ListEntitlementsParams {
  page: number;
  limit: number;
  entitlement?: string;
  is_active?: boolean;
}

export function listEntitlements(
  params: ListEntitlementsParams,
): Promise<ListEntitlementsResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.entitlement !== undefined) {
    query.set('entitlement', params.entitlement);
  }

  if (params.is_active !== undefined) {
    query.set('is_active', String(params.is_active));
  }

  return apiFetch<ListEntitlementsResponse>(
    `/api/v1/admin/entitlements?${query}`,
  );
}

export function manageEntitlement(
  userId: string,
  body: ManageEntitlementRequest,
): Promise<ManageEntitlementResponse> {
  return apiFetch<ManageEntitlementResponse>(
    `/api/v1/admin/users/${encodeURIComponent(userId)}/entitlements`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
}
