import type { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
}

export function SectionHeader({ icon: Icon, title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="size-4 text-on-surface-variant" />
      <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
        {title}
      </h2>
    </div>
  );
}
