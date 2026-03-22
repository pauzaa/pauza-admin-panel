import { useQuery } from '@tanstack/react-query';
import { PackageOpen, Hash } from 'lucide-react';

import { getRCSubscriber } from '@/api/endpoints/revenuecat';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDate } from '@/lib/format';

interface RevenueCatSectionProps {
  userId: string;
}

const TH_CLASS = 'text-xs font-semibold uppercase tracking-wider text-on-surface-variant';

export function RevenueCatSection({ userId }: RevenueCatSectionProps) {
  const rcQuery = useQuery({
    queryKey: ['rc-subscriber', userId],
    queryFn: () => getRCSubscriber(userId),
    staleTime: 60_000,
  });

  return (
    <Card className="border-outline-variant/50 bg-surface-container">
      <CardContent className="p-5 sm:p-6">
        {rcQuery.isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="sm" />
          </div>
        )}

        {rcQuery.error && (
          <ErrorAlert
            message="Could not load subscription details from RevenueCat."
            onRetry={() => { void rcQuery.refetch(); }}
          />
        )}

        {rcQuery.data && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-lg bg-surface-container-high px-4 py-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-container-highest">
                <Hash className="size-3.5 text-on-surface-variant" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  RC App User ID
                </span>
                <code className="mt-0.5 block truncate font-mono text-sm font-semibold text-on-surface">
                  {rcQuery.data.app_user_id}
                </code>
              </div>
            </div>

            {rcQuery.data.entitlements.length === 0 ? (
              <EmptyState
                icon={PackageOpen}
                title="No entitlements"
                description="No entitlements found for this subscriber."
              />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-outline-variant/60">
                <Table className="min-w-[640px]">
                  <TableHeader>
                    <TableRow className="bg-surface-container-high/50 hover:bg-surface-container-high/50">
                      <TableHead className={TH_CLASS}>
                        Entitlement
                      </TableHead>
                      <TableHead className={TH_CLASS}>
                        Status
                      </TableHead>
                      <TableHead className={TH_CLASS}>
                        Product
                      </TableHead>
                      <TableHead className={TH_CLASS}>
                        Purchase Date
                      </TableHead>
                      <TableHead className={TH_CLASS}>
                        Expires
                      </TableHead>
                      <TableHead className={TH_CLASS}>
                        Grace Period
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rcQuery.data.entitlements.map((ent) => (
                      <TableRow key={ent.entitlement_id} className="transition-colors">
                        <TableCell className="text-sm font-medium text-on-surface">
                          {ent.entitlement_id}
                        </TableCell>
                        <TableCell>
                          <StatusBadge active={ent.is_active} />
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate font-mono text-xs text-on-surface-variant">
                          {ent.product_identifier}
                        </TableCell>
                        <TableCell className="text-sm text-on-surface-variant">
                          {formatDate(ent.purchase_date)}
                        </TableCell>
                        <TableCell className="text-sm text-on-surface-variant">
                          {ent.expires_date ? formatDate(ent.expires_date) : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-on-surface-variant">
                          {ent.grace_period_expires_date
                            ? formatDate(ent.grace_period_expires_date)
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
