import { cn } from '@/lib/utils';

interface PauzaLogoProps {
  size?: 'sm' | 'md';
}

export function PauzaLogo({ size = 'sm' }: PauzaLogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-primary shadow-sm',
          size === 'sm' ? 'size-8' : 'size-10',
        )}
      >
        <span
          className={cn(
            'font-bold tracking-tight text-on-primary',
            size === 'sm' ? 'text-sm' : 'text-base',
          )}
        >
          P
        </span>
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            'font-semibold tracking-tight text-on-surface',
            size === 'sm' ? 'text-sm' : 'text-lg',
          )}
        >
          Pauza
        </span>
        <span
          className={cn(
            'font-medium text-on-surface-variant',
            size === 'sm' ? 'text-[10px] leading-none' : 'text-xs',
          )}
        >
          Admin
        </span>
      </div>
    </div>
  );
}
