import type { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDuration, formatNumber } from '@/lib/format';

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  formatAs?: 'number' | 'currency' | 'duration' | 'decimal';
  suffix?: string;
  isLoading?: boolean;
}

function formatValue(
  value: number,
  formatAs: StatsCardProps['formatAs'],
  suffix?: string,
): string {
  switch (formatAs) {
    case 'currency':
      return formatCurrency(value);
    case 'duration':
      return formatDuration(value);
    case 'decimal':
      return `${value.toFixed(1)}${suffix ? ` ${suffix}` : ''}`;
    case 'number':
    default:
      return formatNumber(value);
  }
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  formatAs = 'number',
  suffix,
  isLoading,
}: StatsCardProps) {
  return (
    <Card className="bg-surface-container">
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Icon className="size-5 text-on-surface-variant" />
          <span className="text-sm text-on-surface-variant">{label}</span>
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <span className="text-2xl font-bold text-on-surface">
            {formatValue(value, formatAs, suffix)}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
