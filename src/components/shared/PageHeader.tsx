import type { LucideIcon } from 'lucide-react';

import { formatNumber } from '@/lib/format';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  count?: number;
}

export function PageHeader({ icon: Icon, title, description, count }: PageHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-5 text-primary" />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-semibold tracking-tight text-on-surface">
            {title}
          </h1>
          {count !== undefined && count > 0 && (
            <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-xs font-medium text-on-surface-variant">
              {formatNumber(count)}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-on-surface-variant">{description}</p>
        )}
      </div>
    </div>
  );
}
