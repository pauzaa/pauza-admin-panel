import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Lock } from 'lucide-react';

import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PauzaLogo } from '@/components/shared/PauzaLogo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useAuth } from '@/features/auth/useAuth';
import { cn } from '@/lib/utils';

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'UNAUTHORIZED':
        return 'Invalid username or password';
      case 'RATE_LIMITED':
        return 'Too many attempts. Please wait.';
      case 'NETWORK_ERROR':
        return 'Unable to connect to server';
      default:
        return error.message;
    }
  }
  return 'An unexpected error occurred';
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    void login(username, password)
      .then(() => {
        void navigate('/', { replace: true });
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-surface-dim p-4">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 size-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Theme toggle */}
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-sm rounded-2xl border border-outline-variant bg-surface p-8 shadow-lg">
        {/* Branding */}
        <div className="flex flex-col items-center gap-3 pb-8">
          <PauzaLogo size="md" />
          <p className="text-sm text-on-surface-variant">
            Sign in to your account
          </p>
        </div>

        {/* Error alert */}
        {error !== null && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="username"
              className="text-sm font-medium text-on-surface"
            >
              Username
            </label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              autoFocus
              autoComplete="username"
              className="h-11"
              value={username}
              onChange={(e) => { setUsername(e.target.value); }}
              disabled={isLoading}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-on-surface"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              className="h-11"
              value={password}
              onChange={(e) => { setPassword(e.target.value); }}
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className={cn(
              'mt-2 h-11 w-full gap-2 transition-all duration-200',
              isLoading && 'opacity-80',
            )}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <Lock className="size-4" />
                Sign in
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
