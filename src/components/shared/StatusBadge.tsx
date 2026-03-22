import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  active: boolean;
}

export function StatusBadge({ active }: StatusBadgeProps) {
  return (
    <Badge
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border-none px-2.5 py-0.5 text-xs font-medium',
        active
          ? 'bg-success-container text-on-success-container'
          : 'bg-surface-container-highest text-on-surface-variant',
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          active ? 'bg-success' : 'bg-on-surface-variant/50',
        )}
      />
      {active ? 'Active' : 'Inactive'}
    </Badge>
  );
}
