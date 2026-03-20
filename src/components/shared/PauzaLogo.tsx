import { cn } from '@/lib/utils';

interface PauzaLogoProps {
  size?: 'sm' | 'md';
}

export function PauzaLogo({ size = 'sm' }: PauzaLogoProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex items-center justify-center bg-primary',
          size === 'sm' ? 'size-7 rounded-md' : 'size-10 rounded-lg',
        )}
      >
        <span
          className={cn(
            'font-bold tracking-tight text-on-primary',
            size === 'sm' ? 'text-xs' : 'text-base',
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
            'text-on-surface-variant',
            size === 'sm' ? 'text-[10px] leading-none' : 'text-xs',
          )}
        >
          Admin Panel
        </span>
      </div>
    </div>
  );
}
