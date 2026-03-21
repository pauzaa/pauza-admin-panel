import { useState } from 'react';

import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  email: string;
  profilePictureUrl: string | null;
  size?: 'sm' | 'lg';
}

function getInitials(name: string, email: string): string {
  if (name.trim()) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    return (first + last).toUpperCase();
  }
  return (email[0] ?? '').toUpperCase();
}

export function UserAvatar({ name, email, profilePictureUrl, size = 'sm' }: UserAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = getInitials(name, email);

  const sizeClasses = size === 'sm'
    ? 'size-8 text-xs'
    : 'size-16 text-base';

  if (profilePictureUrl && !imgFailed) {
    return (
      <img
        src={profilePictureUrl}
        alt={name || email}
        onError={() => { setImgFailed(true); }}
        className={cn('rounded-full object-cover', sizeClasses)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-primary/10 font-medium text-primary',
        sizeClasses,
      )}
    >
      {initials}
    </div>
  );
}
