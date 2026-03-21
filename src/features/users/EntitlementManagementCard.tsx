import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { manageEntitlement } from '@/api/endpoints/entitlements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDate } from '@/lib/format';
import type { UserDetail } from '@/types/user';
import type { ManageEntitlementRequest } from '@/types/entitlement';

interface EntitlementManagementCardProps {
  user: UserDetail;
}

export function EntitlementManagementCard({ user }: EntitlementManagementCardProps) {
  const [expiresAt, setExpiresAt] = useState('');
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (body: ManageEntitlementRequest) => manageEntitlement(user.id, body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['user', user.id] });
      void queryClient.invalidateQueries({ queryKey: ['entitlements'] });
      void queryClient.invalidateQueries({ queryKey: ['stats'] });
      setShowGrantDialog(false);
      setShowRevokeDialog(false);
      setExpiresAt('');
      toast.success(
        variables.action === 'grant' ? 'Premium granted' : 'Premium revoked',
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function handleGrant() {
    const expiresAtMs = expiresAt ? new Date(expiresAt).getTime() : undefined;
    mutation.mutate({
      action: 'grant',
      entitlement: 'premium',
      ...(expiresAtMs ? { expires_at: expiresAtMs } : {}),
    });
  }

  function handleRevoke() {
    mutation.mutate({ action: 'revoke', entitlement: 'premium' });
  }

  const expiresAtFormatted = expiresAt
    ? formatDate(new Date(expiresAt).getTime())
    : null;

  return (
    <Card className="bg-surface-container">
      <CardHeader>
        <CardTitle>Entitlement Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-on-surface">
          <span>Current:</span>
          <StatusBadge active={user.is_premium} />
          {user.is_premium && user.current_period_end && (
            <span className="text-on-surface-variant">
              (expires {formatDate(user.current_period_end)})
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="expires-at"
            className="text-xs font-medium uppercase tracking-wider text-on-surface-variant"
          >
            Expires At (optional)
          </label>
          <Input
            id="expires-at"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => { setExpiresAt(e.target.value); }}
            className="max-w-xs"
          />
        </div>

        <div className="flex gap-3">
          <Button
            className="bg-success text-on-success hover:bg-success/90"
            disabled={user.is_premium || mutation.isPending}
            onClick={() => { setShowGrantDialog(true); }}
          >
            Grant Premium
          </Button>
          <Button
            variant="destructive"
            disabled={!user.is_premium || mutation.isPending}
            onClick={() => { setShowRevokeDialog(true); }}
          >
            Revoke Premium
          </Button>
        </div>
      </CardContent>

      <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Premium</DialogTitle>
            <DialogDescription>
              Are you sure you want to grant premium access to{' '}
              <strong>{user.name}</strong>?
              {expiresAtFormatted && (
                <>
                  <br />
                  Expires: {expiresAtFormatted}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              className="bg-success text-on-success hover:bg-success/90"
              disabled={mutation.isPending}
              onClick={handleGrant}
            >
              {mutation.isPending ? <LoadingSpinner size="sm" /> : null}
              Confirm Grant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Premium</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke premium access from{' '}
              <strong>{user.name}</strong>? This action takes effect immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              disabled={mutation.isPending}
              onClick={handleRevoke}
            >
              {mutation.isPending ? <LoadingSpinner size="sm" /> : null}
              Confirm Revoke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
