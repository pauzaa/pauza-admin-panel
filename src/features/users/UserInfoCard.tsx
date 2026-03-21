import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatNumber, formatRelativeTime } from '@/lib/format';
import type { UserDetail } from '@/types/user';

interface InfoField {
  label: string;
  value: string;
  className?: string;
}

interface UserInfoCardProps {
  user: UserDetail;
}

export function UserInfoCard({ user }: UserInfoCardProps) {
  const fields: InfoField[] = [
    { label: 'Email', value: user.email },
    { label: 'Joined', value: formatDate(user.created_at) },
    {
      label: 'Leaderboard',
      value: user.leaderboard_visible ? 'Visible' : 'Hidden',
      className: user.leaderboard_visible ? 'text-sm text-success' : 'text-sm text-on-surface-variant',
    },
    { label: 'Friends', value: formatNumber(user.friend_count) },
    { label: 'Sessions', value: formatNumber(user.total_sessions) },
    {
      label: 'Last Session',
      value: user.last_session_time
        ? formatRelativeTime(user.last_session_time)
        : 'Never',
    },
  ];

  return (
    <Card className="bg-surface-container">
      <CardHeader>
        <CardTitle>User Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">
          {fields.map((field) => (
            <div key={field.label} className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                {field.label}
              </dt>
              <dd className={field.className ?? 'text-sm text-on-surface'}>
                {field.value}
              </dd>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
