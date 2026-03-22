import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-surface-container">
        <Icon className="size-8 text-on-surface-variant/70" />
      </div>
      <p className="mt-5 text-base font-semibold text-on-surface">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-on-surface-variant">
          {description}
        </p>
      )}
    </div>
  );
}
