import type { PaginationResponse } from './api';

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  username: string;
  profile_picture_url: string | null;
  premium_entitlement_active: boolean;
  created_at: string; // RFC 3339
}

export interface ListUsersResponse {
  users: readonly UserListItem[];
  pagination: PaginationResponse;
}

export interface UserDetail {
  id: string;
  email: string;
  name: string;
  username: string;
  profile_picture_url: string | null;
  leaderboard_visible: boolean;
  created_at: string; // RFC 3339
  is_premium: boolean;
  current_period_end: string | null; // RFC 3339
  revenuecat_app_user_id: string | null;
  friend_count: number;
  total_sessions: number;
  last_session_time: number | null; // Unix ms
}
