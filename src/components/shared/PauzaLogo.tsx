import { cn } from '@/lib/utils';

interface PauzaLogoProps {
  size?: 'sm' | 'md';
}

export function PauzaLogo({ size = 'sm' }: PauzaLogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/favicon.svg"
        alt="Pauza"
        className={cn(
          'rounded-lg shadow-sm',
          size === 'sm' ? 'size-8' : 'size-10',
        )}
      />
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
