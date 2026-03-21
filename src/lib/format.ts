const numberFormatter = new Intl.NumberFormat('en-US');
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function formatNumber(n: number): string {
  return numberFormatter.format(n);
}

export function formatCurrency(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours)}h ${String(minutes)}m`;
}

export function formatDate(ms: number): string {
  return dateFormatter.format(new Date(ms));
}

const chartDateFormatters: Record<string, Intl.DateTimeFormat> = {
  short: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }),
  month: new Intl.DateTimeFormat('en-US', { month: 'short' }),
  year: new Intl.DateTimeFormat('en-US', { year: 'numeric' }),
};

export function formatChartDate(dateStr: string, range: '30d' | '90d' | '1y' | 'all'): string {
  const date = new Date(dateStr + 'T00:00:00');
  switch (range) {
    case '30d':
    case '90d':
      return chartDateFormatters.short.format(date);
    case '1y':
      return chartDateFormatters.month.format(date);
    case 'all':
      return chartDateFormatters.year.format(date);
  }
}

export function formatRelativeTime(ms: number): string {
  const diffMs = Date.now() - ms;
  const diffSeconds = Math.floor(diffMs / 1_000);
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${String(diffMinutes)}m ago`;
  if (diffHours < 24) return `${String(diffHours)}h ago`;
  if (diffDays < 30) return `${String(diffDays)}d ago`;

  return dateFormatter.format(new Date(ms));
}
