import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/format';
import { UserAvatar } from '@/components/shared/UserAvatar';
import type { UserDetail } from '@/types/user';

interface UserProfileCardProps {
  user: UserDetail;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <Card className="bg-surface-container">
      <CardContent className="flex flex-col items-center gap-3 py-6">
        <UserAvatar
          name={user.name}
          email={user.email}
          profilePictureUrl={user.profile_picture_url}
          size="lg"
        />

        <div className="flex flex-col items-center gap-1">
          <h2 className="text-lg font-semibold text-on-surface">{user.name}</h2>
          <span className="text-sm text-on-surface-variant">@{user.username}</span>
        </div>

        <StatusBadge active={user.is_premium} />

        {user.is_premium && (
          <span className="text-xs text-on-surface-variant">
            {user.current_period_end
              ? `Expires ${formatDate(user.current_period_end)}`
              : 'No expiry'}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
