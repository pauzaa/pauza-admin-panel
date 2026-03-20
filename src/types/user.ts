import type { PaginationResponse } from './api';

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  username: string;
  profile_picture_url: string | null;
  premium_entitlement_active: boolean;
  created_at: number; // Unix ms
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
  created_at: number; // Unix ms
  is_premium: boolean;
  current_period_end: number | null; // Unix ms
  revenuecat_app_user_id: string | null;
  friend_count: number;
  total_sessions: number;
  last_session_time: number | null; // Unix ms
}
