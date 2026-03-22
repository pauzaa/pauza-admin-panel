import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Crown, User, ShieldCheck, ShieldX, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';

import { manageEntitlement } from '@/api/endpoints/entitlements';
import { Card, CardContent } from '@/components/ui/card';
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
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
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

  const expiresAtMs = expiresAt ? new Date(expiresAt + 'T00:00:00').getTime() : undefined;
  const isExpiresAtInPast = expiresAtMs !== undefined && expiresAtMs <= Date.now();
  const canGrant = !user.is_premium && !!expiresAtMs && !isExpiresAtInPast;

  function handleGrant() {
    if (!expiresAtMs) return;
    mutation.mutate({
      action: 'grant',
      entitlement: 'premium',
      expires_at: expiresAtMs,
    });
  }

  function handleRevoke() {
    mutation.mutate({ action: 'revoke', entitlement: 'premium' });
  }

  const expiresAtFormatted = expiresAtMs ? formatDate(expiresAtMs) : null;

  return (
    <Card className="border-outline-variant/50 bg-surface-container">
      <CardContent className="p-5 sm:p-6">
        <div
          className={cn(
            'flex items-center gap-3.5 rounded-xl p-4',
            user.is_premium
              ? 'bg-success/8 ring-1 ring-inset ring-success/20'
              : 'bg-surface-container-high',
          )}
        >
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-full',
              user.is_premium
                ? 'bg-success/15'
                : 'bg-surface-container-highest',
            )}
          >
            {user.is_premium ? (
              <Crown className="size-5 text-success" />
            ) : (
              <User className="size-5 text-on-surface-variant" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">
              {user.is_premium ? 'Premium Active' : 'Free User'}
            </p>
            {user.is_premium && user.current_period_end && (
              <p className="mt-0.5 text-xs text-on-surface-variant">
                Expires {formatDate(user.current_period_end)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <label
            htmlFor="expires-at"
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
          >
            <CalendarClock className="size-3.5" />
            Expiration Date
          </label>
          <Input
            id="expires-at"
            type="date"
            value={expiresAt}
            onChange={(e) => { setExpiresAt(e.target.value); }}
            className="max-w-xs"
          />
          {isExpiresAtInPast && (
            <p className="text-xs font-medium text-error">
              Expiry date must be in the future
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            className="bg-success text-on-success shadow-sm hover:bg-success/90"
            disabled={!canGrant || mutation.isPending}
            onClick={() => { setShowGrantDialog(true); }}
          >
            <ShieldCheck className="size-4" />
            Grant Premium
          </Button>
          <Button
            variant="destructive"
            className="shadow-sm"
            disabled={!user.is_premium || mutation.isPending}
            onClick={() => { setShowRevokeDialog(true); }}
          >
            <ShieldX className="size-4" />
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
