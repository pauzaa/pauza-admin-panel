export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const EXPORT_LIMIT = 100;
export const SEARCH_DEBOUNCE_MS = 300;

export const TIME_RANGES = ['30d', '90d', '1y', 'all'] as const;
export type TimeRange = (typeof TIME_RANGES)[number];

export const TIME_RANGE_SHORT_LABELS: Record<TimeRange, string> = {
  '30d': '30d',
  '90d': '90d',
  '1y': '1y',
  all: 'All',
};
