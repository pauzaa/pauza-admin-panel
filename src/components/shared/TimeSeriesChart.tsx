import { useEffect, useMemo, useRef, useState } from 'react';
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

function hasDateString(value: unknown): value is { date: string } {
  if (typeof value !== 'object' || value === null || !('date' in value)) return false;
  const { date } = value;
  return typeof date === 'string';
}

function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    setWidth(el.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const newWidth = Math.round(entry.contentRect.width);
        setWidth((prev) => (prev === newWidth ? prev : newWidth));
      }
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, width };
}

/** Derives responsive chart dimensions from container width. */
function getChartDimensions(containerWidth: number) {
  const isCompact = containerWidth > 0 && containerWidth < 500;

  return {
    chartHeight: isCompact ? 200 : 280,
    yAxisWidth: isCompact ? 36 : 50,
    tickFontSize: isCompact ? 10 : 12,
  } as const;
}

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

function useChartColors(theme: string, color?: string) {
  return useMemo(() => ({
    chartColor: color ?? getCSSColor('--color-primary', '#800020'),
    axisColor: getCSSColor('--color-on-surface-variant', '#6d6470'),
    gridColor: getCSSColor('--color-outline-variant', '#d9d3d8'),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- theme triggers re-read of CSS custom properties
  }), [theme, color]);
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
  const pointData: unknown = point.payload;
  const dateStr = hasDateString(pointData) ? pointData.date : undefined;
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
  const { ref: containerRef, width: containerWidth } = useContainerWidth();
  const { chartHeight, yAxisWidth, tickFontSize } = getChartDimensions(containerWidth);

  const { chartColor, axisColor, gridColor } = useChartColors(theme, color);

  const gradientId = `area-gradient-${title.replace(/\s+/g, '-')}`;
  const mutableData = useMemo(() => [...data], [data]);
  const heightClass = chartHeight === 200 ? 'h-[200px]' : 'h-[280px]';
  const tickStyle = useMemo(() => ({ fontSize: tickFontSize, fill: axisColor }), [tickFontSize, axisColor]);
  const cursorStyle = useMemo(() => ({ stroke: gridColor, strokeDasharray: '3 3' }), [gridColor]);

  return (
    <Card ref={containerRef} className="border border-outline-variant bg-surface-container">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-2 pt-4 sm:px-6 sm:pt-5">
        <h3 className="text-sm font-semibold text-on-surface sm:text-base">{title}</h3>
        <div className="flex flex-wrap items-center gap-1">
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

      <div className="px-1 pb-3 sm:px-2 sm:pb-4">
        {isLoading ? (
          <Skeleton className={cn('mx-4 rounded-lg', heightClass)} />
        ) : data.length === 0 ? (
          <div className={cn('flex items-center justify-center', heightClass)}>
            <p className="text-sm text-on-surface-variant">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer key={theme} width="100%" height={chartHeight}>
            <AreaChart data={mutableData}>
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
                tick={tickStyle}
                dy={8}
              />
              <YAxis
                tickFormatter={yAxisFormatter}
                axisLine={false}
                tickLine={false}
                tick={tickStyle}
                width={yAxisWidth}
              />
              <Tooltip
                content={(props) => (
                  <ChartTooltipContent
                    rechartProps={props}
                    range={range}
                    tooltipFormatter={tooltipFormatter}
                  />
                )}
                cursor={cursorStyle}
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
