import {
  Mail,
  CalendarDays,
  Crown,
  Eye,
  EyeOff,
  Users,
  Activity,
  Clock,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { formatDate, formatNumber, formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { UserDetail } from '@/types/user';
import type { LucideIcon } from 'lucide-react';

interface UserHeroCardProps {
  user: UserDetail;
}

interface InfoFieldConfig {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly value: string;
  readonly highlight?: boolean;
}

function InfoField({ icon: Icon, label, value, highlight }: InfoFieldConfig) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high">
        <Icon className="size-4 text-on-surface-variant" />
      </div>
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
          {label}
        </dt>
        <dd
          className={cn(
            'mt-0.5 truncate text-sm font-semibold',
            highlight ? 'text-success' : 'text-on-surface',
          )}
        >
          {value}
        </dd>
      </div>
    </div>
  );
}

export function UserHeroCard({ user }: UserHeroCardProps) {
  const fields: readonly InfoFieldConfig[] = [
    {
      icon: Mail,
      label: 'Email',
      value: user.email,
    },
    {
      icon: CalendarDays,
      label: 'Joined',
      value: formatDate(user.created_at),
    },
    {
      icon: user.leaderboard_visible ? Eye : EyeOff,
      label: 'Leaderboard',
      value: user.leaderboard_visible ? 'Visible' : 'Hidden',
      highlight: user.leaderboard_visible,
    },
    {
      icon: Users,
      label: 'Friends',
      value: formatNumber(user.friend_count),
    },
    {
      icon: Activity,
      label: 'Total Sessions',
      value: formatNumber(user.total_sessions),
    },
    {
      icon: Clock,
      label: 'Last Session',
      value: user.last_session_time
        ? formatRelativeTime(user.last_session_time)
        : 'Never',
    },
  ];

  return (
    <Card className="overflow-hidden border-outline-variant/50 bg-surface-container">
      <div className="h-1.5 bg-primary/15" />

      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <UserAvatar
              name={user.name}
              email={user.email}
              profilePictureUrl={user.profile_picture_url}
              size="lg"
            />
            {user.is_premium && (
              <div className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-primary shadow-sm">
                <Crown className="size-3 text-on-primary" />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <h2 className="truncate text-xl font-bold tracking-tight text-on-surface">
                {user.name}
              </h2>
              <StatusBadge active={user.is_premium} />
            </div>
            <span className="text-sm text-on-surface-variant">
              @{user.username}
            </span>
          </div>

          {user.is_premium && user.current_period_end && (
            <span className="hidden shrink-0 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary sm:inline-block">
              Expires {formatDate(user.current_period_end)}
            </span>
          )}
        </div>

        <div className="my-5 border-t border-outline-variant/60" />

        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <InfoField key={field.label} {...field} />
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
