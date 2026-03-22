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
    <Card className="border-outline-variant/50 bg-surface-container">
      <CardContent className="flex items-start gap-4 p-4 lg:p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 lg:size-11">
          <Icon className="size-5 text-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-on-surface-variant lg:text-sm">
            {label}
          </span>
          {isLoading ? (
            <Skeleton className="h-7 w-20 lg:h-8 lg:w-24" />
          ) : (
            <span className="text-xl font-bold tracking-tight text-on-surface lg:text-2xl">
              {formatValue(value, formatAs, suffix)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
