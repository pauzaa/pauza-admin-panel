import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  active: boolean;
}

export function StatusBadge({ active }: StatusBadgeProps) {
  return (
    <Badge
      className={cn(
        'rounded-full border-none font-medium',
        active
          ? 'bg-success-container text-on-success-container'
          : 'bg-surface-container-highest text-on-surface-variant',
      )}
    >
      {active ? 'Active' : 'Inactive'}
    </Badge>
  );
}
