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
      className="flex items-center gap-3 rounded-lg bg-error-container p-4"
    >
      <AlertTriangle className="size-5 shrink-0 text-on-error-container" />
      <p className="flex-1 text-sm text-on-error-container">{message}</p>
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
