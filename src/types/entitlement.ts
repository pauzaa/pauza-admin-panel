import type { PaginationResponse } from './api';

export interface EntitlementListItem {
  user_id: string;
  email: string;
  username: string;
  entitlement: string;
  is_active: boolean;
  current_period_end: string | null; // RFC 3339
  updated_at: string; // RFC 3339
}

export interface ListEntitlementsResponse {
  entitlements: readonly EntitlementListItem[];
  pagination: PaginationResponse;
}

export interface ManageEntitlementRequest {
  action: 'grant' | 'revoke';
  entitlement: 'premium';
  expires_at?: string; // RFC 3339, must be in the future
}

export interface ManageEntitlementResponse {
  message: string;
}
