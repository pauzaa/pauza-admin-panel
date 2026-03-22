import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-error/20 bg-error-container p-4"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-on-error-container/10">
        <AlertTriangle className="size-4 text-on-error-container" />
      </div>
      <p className="flex-1 pt-1 text-sm font-medium leading-relaxed text-on-error-container">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="shrink-0 text-on-error-container hover:bg-on-error-container/10"
        >
          Retry
        </Button>
      )}
    </div>
  );
}
