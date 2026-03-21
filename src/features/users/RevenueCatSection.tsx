import { useQuery } from '@tanstack/react-query';

import { getRCSubscriber } from '@/api/endpoints/revenuecat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
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
    <Card className="bg-surface-container">
      <CardHeader>
        <CardTitle>RevenueCat Subscription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rcQuery.isLoading && (
          <div className="flex justify-center py-4">
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
          <>
            <p className="text-sm text-on-surface-variant">
              RC App User ID:{' '}
              <span className="font-mono text-sm text-on-surface">
                {rcQuery.data.app_user_id}
              </span>
            </p>

            <div className="overflow-hidden rounded-lg border border-outline-variant">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-container hover:bg-surface-container">
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
                    <TableRow key={ent.entitlement_id}>
                      <TableCell className="text-sm text-on-surface">
                        {ent.entitlement_id}
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={ent.is_active} />
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-on-surface-variant">
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
