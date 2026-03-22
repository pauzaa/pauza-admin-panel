import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Crown, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

import { getUserDetail } from '@/api/endpoints/users';
import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import { UserHeroCard } from './UserHeroCard';
import { EntitlementManagementCard } from './EntitlementManagementCard';
import { RevenueCatSection } from './RevenueCatSection';

function UserDetailSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      <Skeleton className="h-9 w-32 rounded-lg" />

      <Card className="overflow-hidden border-outline-variant/50 bg-surface-container">
        <div className="h-1.5 bg-primary/10" />
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2.5">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="hidden h-7 w-24 rounded-full sm:block" />
          </div>
          <div className="my-5 border-t border-outline-variant/60" />
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3 sm:space-y-4">
        <Skeleton className="h-5 w-56" />
        <Card className="border-outline-variant/50 bg-surface-container">
          <CardContent className="space-y-4 p-5 sm:p-6">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-18 w-full rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-10 w-64" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-36 rounded-lg" />
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const userQuery = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserDetail(id ?? ''),
    staleTime: 30_000,
    enabled: !!id,
  });

  useEffect(() => {
    if (userQuery.error instanceof ApiError && userQuery.error.code === 'NOT_FOUND') {
      toast.error('User not found');
      void navigate('/users');
    }
  }, [userQuery.error, navigate]);

  if (userQuery.isLoading) {
    return <UserDetailSkeleton />;
  }

  if (userQuery.error) {
    if (userQuery.error instanceof ApiError && userQuery.error.code === 'NOT_FOUND') {
      return null;
    }
    return (
      <ErrorAlert
        message="Failed to load user."
        onRetry={() => { void userQuery.refetch(); }}
      />
    );
  }

  if (!userQuery.data) return null;

  const user = userQuery.data;

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      <Button
        variant="ghost"
        onClick={() => { void navigate('/users'); }}
        className="gap-2 text-on-surface-variant transition-colors hover:text-on-surface"
      >
        <ArrowLeft className="size-4" />
        Back to Users
      </Button>

      <UserHeroCard user={user} />

      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
            <Crown className="size-3.5 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-on-surface sm:text-lg">
            Subscription Management
          </h2>
        </div>
        <EntitlementManagementCard user={user} />
      </section>

      {user.revenuecat_app_user_id && (
        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
              <CreditCard className="size-3.5 text-primary" />
            </div>
            <h2 className="text-base font-semibold text-on-surface sm:text-lg">
              RevenueCat Data
            </h2>
          </div>
          <RevenueCatSection userId={user.id} />
        </section>
      )}
    </div>
  );
}
