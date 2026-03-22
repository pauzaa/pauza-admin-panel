import type { PlatformStats, TimeSeriesResponse } from '@/types/stats';
import type { Granularity, TimeRange } from '@/lib/constants';

import { apiFetch } from '@/api/client';

export function getPlatformStats(): Promise<PlatformStats> {
  return apiFetch<PlatformStats>('/api/v1/admin/stats');
}

export function getUserGrowth(
  range: TimeRange,
  granularity?: Granularity,
): Promise<TimeSeriesResponse> {
  const query = new URLSearchParams({ range });
  if (granularity) query.set('granularity', granularity);
  return apiFetch<TimeSeriesResponse>(
    `/api/v1/admin/stats/user-growth?${query}`,
  );
}

export function getActiveUsers(
  range: TimeRange,
  granularity?: Granularity,
): Promise<TimeSeriesResponse> {
  const query = new URLSearchParams({ range });
  if (granularity) query.set('granularity', granularity);
  return apiFetch<TimeSeriesResponse>(
    `/api/v1/admin/stats/active-users?${query}`,
  );
}
