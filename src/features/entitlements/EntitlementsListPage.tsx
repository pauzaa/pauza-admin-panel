import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { listEntitlements } from '@/api/endpoints/entitlements';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import { DEFAULT_PAGE, DEFAULT_LIMIT, EXPORT_LIMIT } from '@/lib/constants';
import { formatDate, formatRelativeTime } from '@/lib/format';
import { fetchAllPages, downloadCSV } from '@/lib/csv';
import { cn } from '@/lib/utils';
import type { Column } from '@/components/shared/DataTable';
import type { EntitlementListItem } from '@/types/entitlement';

const FILTER_OPTIONS = [
  { label: 'All', value: undefined },
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
] as const;

function renderExpiry(row: EntitlementListItem): React.ReactNode {
  if (row.current_period_end === null) {
    return (
      <span className="text-sm text-on-surface-variant">Indefinite</span>
    );
  }

  if (row.current_period_end < Date.now()) {
    return (
      <span className="text-sm text-error">Expired</span>
    );
  }

  return (
    <span className="text-sm text-on-surface-variant">
      {formatDate(row.current_period_end)}
    </span>
  );
}

const columns: Column<EntitlementListItem>[] = [
  {
    key: 'email',
    header: 'Email',
    render: (row) => (
      <span className="text-sm text-on-surface">{row.email}</span>
    ),
  },
  {
    key: 'username',
    header: 'Username',
    render: (row) => (
      <span className="text-sm text-on-surface-variant">@{row.username}</span>
    ),
  },
  {
    key: 'type',
    header: 'Type',
    width: '100px',
    render: (row) => (
      <span className="text-sm text-on-surface-variant capitalize">
        {row.entitlement}
      </span>
    ),
  },
  {
    key: 'active',
    header: 'Active',
    width: '100px',
    render: (row) => <StatusBadge active={row.is_active} />,
  },
  {
    key: 'expires',
    header: 'Expires',
    width: '130px',
    render: renderExpiry,
  },
  {
    key: 'updated',
    header: 'Updated',
    width: '120px',
    render: (row) => (
      <span className="text-sm text-on-surface-variant">
        {formatRelativeTime(row.updated_at)}
      </span>
    ),
  },
  {
    key: 'action',
    header: '',
    width: '48px',
    render: () => <ChevronRight className="size-4 text-on-surface-variant" />,
  },
];

export function EntitlementsListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [filter, setFilter] = useState<boolean | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);

  const entitlementsQuery = useQuery({
    queryKey: ['entitlements', { page, limit: DEFAULT_LIMIT, isActive: filter }],
    queryFn: () =>
      listEntitlements({
        page,
        limit: DEFAULT_LIMIT,
        entitlement: 'premium',
        is_active: filter,
      }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  function handleFilterChange(value: boolean | undefined) {
    setFilter(value);
    setPage(DEFAULT_PAGE);
  }

  function handleRowClick(row: EntitlementListItem) {
    void navigate(`/users/${row.user_id}`);
  }

  async function handleExportCSV() {
    setIsExporting(true);
    try {
      const allEntitlements = await fetchAllPages(
        (p) =>
          listEntitlements({
            page: p,
            limit: EXPORT_LIMIT,
            entitlement: 'premium',
            is_active: filter,
          }),
        (res) => ({ items: res.entitlements, total: res.pagination.total }),
      );
      downloadCSV(allEntitlements, 'pauza_entitlements');
    } catch {
      toast.error('Failed to export entitlements.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-on-surface">Entitlements</h1>

      <div className="inline-flex rounded-lg border border-outline-variant">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => { handleFilterChange(option.value); }}
            className={cn(
              'px-4 py-1.5 text-sm transition-colors first:rounded-l-lg last:rounded-r-lg',
              filter === option.value
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-on-surface-variant hover:bg-surface-container',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {entitlementsQuery.error && (
        <ErrorAlert
          message="Failed to load entitlements."
          onRetry={() => { void entitlementsQuery.refetch(); }}
        />
      )}

      <DataTable
        columns={columns}
        data={entitlementsQuery.data?.entitlements ?? []}
        keyExtractor={(row) => row.user_id}
        pagination={
          entitlementsQuery.data?.pagination ?? {
            page,
            limit: DEFAULT_LIMIT,
            total: 0,
          }
        }
        onPageChange={setPage}
        onRowClick={handleRowClick}
        onExportCSV={() => { void handleExportCSV(); }}
        isExporting={isExporting}
        isLoading={entitlementsQuery.isLoading}
      />
    </div>
  );
}
