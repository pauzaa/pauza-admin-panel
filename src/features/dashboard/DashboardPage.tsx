import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Clock,
  CreditCard,
  Crown,
  DollarSign,
  Flame,
  Gift,
  Heart,
  TrendingUp,
  Users,
} from 'lucide-react';

import { getPlatformStats, getUserGrowth, getActiveUsers } from '@/api/endpoints/stats';
import { getRCOverview, getRCChart } from '@/api/endpoints/revenuecat';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import { StatsCard } from '@/components/shared/StatsCard';
import { TimeSeriesChart } from '@/components/shared/TimeSeriesChart';
import type { TimeRange } from '@/lib/constants';
import { formatCurrency, formatNumber } from '@/lib/format';

export function DashboardPage() {
  const [userGrowthRange, setUserGrowthRange] = useState<TimeRange>('30d');
  const [activeUsersRange, setActiveUsersRange] = useState<TimeRange>('30d');
  const [revenueRange, setRevenueRange] = useState<TimeRange>('30d');

  const statsQuery = useQuery({
    queryKey: ['stats'],
    queryFn: getPlatformStats,
    staleTime: 60_000,
  });

  const rcOverviewQuery = useQuery({
    queryKey: ['rc-overview'],
    queryFn: getRCOverview,
    staleTime: 300_000,
  });

  const userGrowthQuery = useQuery({
    queryKey: ['user-growth', userGrowthRange],
    queryFn: () => getUserGrowth(userGrowthRange),
    staleTime: 120_000,
  });

  const activeUsersQuery = useQuery({
    queryKey: ['active-users', activeUsersRange],
    queryFn: () => getActiveUsers(activeUsersRange),
    staleTime: 120_000,
  });

  const revenueChartQuery = useQuery({
    queryKey: ['rc-chart', 'revenue', revenueRange],
    queryFn: () => getRCChart('revenue', revenueRange),
    staleTime: 300_000,
  });

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base font-semibold text-on-surface sm:text-lg">
          Platform Overview
        </h2>

        {statsQuery.error && (
          <ErrorAlert
            message="Failed to load platform statistics."
            onRetry={() => { void statsQuery.refetch(); }}
          />
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          <StatsCard
            label="Total Users"
            value={statsQuery.data?.total_users ?? 0}
            icon={Users}
            isLoading={statsQuery.isLoading}
          />
          <StatsCard
            label="Active 30d"
            value={statsQuery.data?.active_users_30d ?? 0}
            icon={Activity}
            isLoading={statsQuery.isLoading}
          />
          <StatsCard
            label="Premium"
            value={statsQuery.data?.users_with_premium_entitlement ?? 0}
            icon={Crown}
            isLoading={statsQuery.isLoading}
          />
          <StatsCard
            label="Friendships"
            value={statsQuery.data?.total_friendships ?? 0}
            icon={Heart}
            isLoading={statsQuery.isLoading}
          />
          <StatsCard
            label="Avg Streak"
            value={statsQuery.data?.avg_streak_days ?? 0}
            icon={Flame}
            formatAs="decimal"
            suffix="days"
            isLoading={statsQuery.isLoading}
          />
          <StatsCard
            label="Avg Daily Focus"
            value={statsQuery.data?.avg_daily_focus_time_ms ?? 0}
            icon={Clock}
            formatAs="duration"
            isLoading={statsQuery.isLoading}
          />
        </div>
      </section>

      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base font-semibold text-on-surface sm:text-lg">
          Revenue Overview
        </h2>

        {rcOverviewQuery.error && (
          <ErrorAlert
            message="Failed to load revenue data."
            onRetry={() => { void rcOverviewQuery.refetch(); }}
          />
        )}

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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

      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base font-semibold text-on-surface sm:text-lg">Trends</h2>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
          <TimeSeriesChart
            title="User Growth"
            data={userGrowthQuery.data?.data ?? []}
            range={userGrowthRange}
            onRangeChange={setUserGrowthRange}
            yAxisFormatter={formatNumber}
            tooltipFormatter={formatNumber}
            isLoading={userGrowthQuery.isLoading}
          />
          <TimeSeriesChart
            title="Active Users"
            data={activeUsersQuery.data?.data ?? []}
            range={activeUsersRange}
            onRangeChange={setActiveUsersRange}
            yAxisFormatter={formatNumber}
            tooltipFormatter={formatNumber}
            isLoading={activeUsersQuery.isLoading}
          />
          <div className="lg:col-span-2">
            <TimeSeriesChart
              title="Revenue Over Time"
              data={revenueChartQuery.data?.data ?? []}
              range={revenueRange}
              onRangeChange={setRevenueRange}
              yAxisFormatter={formatCurrency}
              tooltipFormatter={formatCurrency}
              isLoading={revenueChartQuery.isLoading}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
