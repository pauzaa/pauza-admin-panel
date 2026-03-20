import type { PlatformStats, TimeSeriesResponse } from '@/types/stats';
import type { TimeRange } from '@/lib/constants';

import { apiFetch } from '@/api/client';

export function getPlatformStats(): Promise<PlatformStats> {
  return apiFetch<PlatformStats>('/api/v1/admin/stats');
}

export function getUserGrowth(range: TimeRange): Promise<TimeSeriesResponse> {
  const query = new URLSearchParams({ range });
  return apiFetch<TimeSeriesResponse>(
    `/api/v1/admin/stats/user-growth?${query}`,
  );
}

export function getActiveUsers(range: TimeRange): Promise<TimeSeriesResponse> {
  const query = new URLSearchParams({ range });
  return apiFetch<TimeSeriesResponse>(
    `/api/v1/admin/stats/active-users?${query}`,
  );
}
