import type {
  RCOverview,
  RCChartResponse,
  RCChartName,
  RCSubscriberDetail,
} from '@/types/revenuecat';
import type { TimeRange } from '@/lib/constants';

import { apiFetch } from '@/api/client';

export function getRCOverview(): Promise<RCOverview> {
  return apiFetch<RCOverview>('/api/v1/admin/revenuecat/overview');
}

export function getRCChart(
  chartName: RCChartName,
  range: TimeRange,
): Promise<RCChartResponse> {
  const query = new URLSearchParams({ range });
  return apiFetch<RCChartResponse>(
    `/api/v1/admin/revenuecat/charts/${encodeURIComponent(chartName)}?${query}`,
  );
}

export function getRCSubscriber(
  userId: string,
): Promise<RCSubscriberDetail> {
  return apiFetch<RCSubscriberDetail>(
    `/api/v1/admin/users/${encodeURIComponent(userId)}/revenuecat`,
  );
}
