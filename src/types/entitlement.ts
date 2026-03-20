import type { PaginationResponse } from './api';

export interface EntitlementListItem {
  user_id: string;
  email: string;
  username: string;
  entitlement: string;
  is_active: boolean;
  current_period_end: number | null; // Unix ms
  updated_at: number; // Unix ms
}

export interface ListEntitlementsResponse {
  entitlements: readonly EntitlementListItem[];
  pagination: PaginationResponse;
}

export interface ManageEntitlementRequest {
  action: 'grant' | 'revoke';
  entitlement: 'premium';
  expires_at?: number; // Unix ms, must be in the future
}

export interface ManageEntitlementResponse {
  message: string;
}
