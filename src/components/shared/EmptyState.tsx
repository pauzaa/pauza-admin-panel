import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <Icon className="size-12 text-on-surface-variant" />
      <p className="mt-4 text-base font-medium text-on-surface">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
      )}
    </div>
  );
}
