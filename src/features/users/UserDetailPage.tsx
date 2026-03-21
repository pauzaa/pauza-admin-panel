import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { getUserDetail } from '@/api/endpoints/users';
import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { UserProfileCard } from './UserProfileCard';
import { UserInfoCard } from './UserInfoCard';
import { EntitlementManagementCard } from './EntitlementManagementCard';
import { RevenueCatSection } from './RevenueCatSection';

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
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
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
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => { void navigate('/users'); }}
      >
        <ArrowLeft className="size-4" />
        Back to Users
      </Button>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
        <UserProfileCard user={user} />
        <UserInfoCard user={user} />
      </div>

      <EntitlementManagementCard user={user} />

      {user.revenuecat_app_user_id && (
        <RevenueCatSection userId={user.id} />
      )}
    </div>
  );
}
