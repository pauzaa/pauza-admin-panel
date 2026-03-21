import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
} as const;

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-primary', sizeClasses[size])}
      aria-hidden="true"
    />
  );
}
