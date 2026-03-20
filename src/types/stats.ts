export interface PlatformStats {
  total_users: number;
  active_users_30d: number;
  users_with_premium_entitlement: number;
  total_friendships: number;
  avg_streak_days: number;
  avg_daily_focus_time_ms: number;
}

export interface TimeSeriesPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface TimeSeriesResponse {
  data: readonly TimeSeriesPoint[];
  granularity: 'day' | 'week' | 'month';
}
