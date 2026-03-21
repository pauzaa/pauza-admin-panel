import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

import { ErrorAlert } from '@/components/shared/ErrorAlert';

interface ErrorBoundaryInnerProps {
  children: ReactNode;
  onReset: () => void;
}

interface ErrorBoundaryInnerState {
  error: Error | null;
}

class ErrorBoundaryInner extends Component<
  ErrorBoundaryInnerProps,
  ErrorBoundaryInnerState
> {
  state: ErrorBoundaryInnerState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryInnerState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Page error:', error, info);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <ErrorAlert
          message="Something went wrong."
          onRetry={() => {
            this.setState({ error: null });
            this.props.onReset();
          }}
        />
      );
    }
    return this.props.children;
  }
}

interface QueryErrorBoundaryProps {
  children: ReactNode;
}

export function QueryErrorBoundary({ children }: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundaryInner onReset={reset}>{children}</ErrorBoundaryInner>
      )}
    </QueryErrorResetBoundary>
  );
}
