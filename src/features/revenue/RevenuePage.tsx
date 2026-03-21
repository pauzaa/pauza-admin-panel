import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, DollarSign, Gift, TrendingUp } from 'lucide-react';

import { getRCOverview, getRCChart } from '@/api/endpoints/revenuecat';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import { StatsCard } from '@/components/shared/StatsCard';
import { TimeSeriesChart } from '@/components/shared/TimeSeriesChart';
import type { TimeRange } from '@/lib/constants';
import { formatCurrency, formatNumber } from '@/lib/format';

export function RevenuePage() {
  const [revenueRange, setRevenueRange] = useState<TimeRange>('30d');
  const [subsRange, setSubsRange] = useState<TimeRange>('30d');

  const rcOverviewQuery = useQuery({
    queryKey: ['rc-overview'],
    queryFn: getRCOverview,
    staleTime: 300_000,
  });

  const revenueChartQuery = useQuery({
    queryKey: ['rc-chart', 'revenue', revenueRange],
    queryFn: () => getRCChart('revenue', revenueRange),
    staleTime: 300_000,
  });

  const subsChartQuery = useQuery({
    queryKey: ['rc-chart', 'customers_new', subsRange],
    queryFn: () => getRCChart('customers_new', subsRange),
    staleTime: 300_000,
  });

  return (
    <div className="space-y-6 lg:space-y-8">
      <h1 className="text-lg font-semibold text-on-surface">Revenue</h1>

      <section className="space-y-3 lg:space-y-4">
        <h2 className="text-lg font-semibold text-on-surface">Overview</h2>

        {rcOverviewQuery.error && (
          <ErrorAlert
            message="Failed to load revenue data."
            onRetry={() => { void rcOverviewQuery.refetch(); }}
          />
        )}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatsCard
            label="MRR"
            value={rcOverviewQuery.data?.mrr ?? 0}
            icon={TrendingUp}
            formatAs="currency"
            isLoading={rcOverviewQuery.isLoading}
          />
          <StatsCard
            label="ARR"
            value={rcOverviewQuery.data?.arr ?? 0}
            icon={DollarSign}
            formatAs="currency"
            isLoading={rcOverviewQuery.isLoading}
          />
          <StatsCard
            label="Active Subscribers"
            value={rcOverviewQuery.data?.active_subscribers ?? 0}
            icon={CreditCard}
            isLoading={rcOverviewQuery.isLoading}
          />
          <StatsCard
            label="Active Trials"
            value={rcOverviewQuery.data?.active_trials ?? 0}
            icon={Gift}
            isLoading={rcOverviewQuery.isLoading}
          />
        </div>
      </section>

      <section className="space-y-3 lg:space-y-4">
        <h2 className="text-lg font-semibold text-on-surface">Trends</h2>

        {revenueChartQuery.error && (
          <ErrorAlert
            message="Failed to load revenue chart."
            onRetry={() => { void revenueChartQuery.refetch(); }}
          />
        )}

        {subsChartQuery.error && (
          <ErrorAlert
            message="Failed to load subscriptions chart."
            onRetry={() => { void subsChartQuery.refetch(); }}
          />
        )}

        <div className="grid grid-cols-1 gap-4">
          <TimeSeriesChart
            title="Revenue Over Time"
            data={revenueChartQuery.data?.data ?? []}
            range={revenueRange}
            onRangeChange={setRevenueRange}
            yAxisFormatter={formatCurrency}
            tooltipFormatter={formatCurrency}
            isLoading={revenueChartQuery.isLoading}
          />
          <TimeSeriesChart
            title="New Subscriptions Over Time"
            data={subsChartQuery.data?.data ?? []}
            range={subsRange}
            onRangeChange={setSubsRange}
            yAxisFormatter={formatNumber}
            tooltipFormatter={formatNumber}
            isLoading={subsChartQuery.isLoading}
          />
        </div>
      </section>
    </div>
  );
}
