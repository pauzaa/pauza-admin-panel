import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { TooltipProps } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/useTheme';
import { TIME_RANGES, TIME_RANGE_SHORT_LABELS } from '@/lib/constants';
import type { TimeRange } from '@/lib/constants';
import { formatChartDate } from '@/lib/format';
import { cn } from '@/lib/utils';

interface TimeSeriesChartProps {
  data: ReadonlyArray<{ date: string; value: number }>;
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  title: string;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
  isLoading?: boolean;
  color?: string;
}

function getCSSColor(varName: string, fallback: string): string {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim() || fallback
  );
}

interface ChartTooltipContentProps {
  rechartProps: TooltipProps<number, string>;
  range: TimeRange;
  tooltipFormatter?: (value: number) => string;
}

function ChartTooltipContent({
  rechartProps,
  range,
  tooltipFormatter,
}: ChartTooltipContentProps) {
  const { active, payload } = rechartProps;

  if (!active || !payload?.[0]) return null;

  const point = payload[0];
  const pointData = point.payload as Record<string, unknown>;
  const dateStr = typeof pointData['date'] === 'string' ? pointData['date'] : undefined;
  const value = point.value;

  if (!dateStr || value === undefined) return null;

  const formattedDate = formatChartDate(dateStr, range);
  const formattedValue = tooltipFormatter ? tooltipFormatter(value) : String(value);

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-highest p-3 shadow-lg">
      <p className="text-xs text-on-surface-variant">{formattedDate}</p>
      <p className="text-sm font-semibold text-on-surface">{formattedValue}</p>
    </div>
  );
}

export function TimeSeriesChart({
  data,
  range,
  onRangeChange,
  title,
  yAxisFormatter = String,
  tooltipFormatter,
  isLoading,
  color,
}: TimeSeriesChartProps) {
  const { theme } = useTheme();
  const chartColor = color ?? getCSSColor('--color-primary', '#800020');
  const axisColor = getCSSColor('--color-on-surface-variant', '#6d6470');
  const gridColor = getCSSColor('--color-outline-variant', '#d9d3d8');
  const gradientId = `area-gradient-${title.replace(/\s+/g, '-')}`;

  return (
    <Card className="border border-outline-variant bg-surface-container">
      <div className="flex items-center justify-between px-6 pb-2 pt-5">
        <h3 className="text-base font-semibold text-on-surface">{title}</h3>
        <div className="flex items-center gap-1">
          {TIME_RANGES.map((r) => (
            <Button
              key={r}
              size="xs"
              variant={r === range ? 'default' : 'ghost'}
              className={cn(
                'rounded-md',
                r === range && 'bg-primary text-on-primary',
              )}
              onClick={() => { onRangeChange(r); }}
            >
              {TIME_RANGE_SHORT_LABELS[r]}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-2 pb-4">
        {isLoading ? (
          <Skeleton className="mx-4 h-[280px] rounded-lg" />
        ) : data.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center">
            <p className="text-sm text-on-surface-variant">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer key={theme} width="100%" height={280}>
            <AreaChart data={[...data]}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridColor}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={(dateStr: string) => formatChartDate(dateStr, range)}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: axisColor }}
                dy={8}
              />
              <YAxis
                tickFormatter={yAxisFormatter}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: axisColor }}
                width={50}
              />
              <Tooltip
                content={(props) => (
                  <ChartTooltipContent
                    rechartProps={props}
                    range={range}
                    tooltipFormatter={tooltipFormatter}
                  />
                )}
                cursor={{ stroke: gridColor, strokeDasharray: '3 3' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
