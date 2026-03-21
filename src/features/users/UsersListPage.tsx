import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { listUsers } from '@/api/endpoints/users';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  EXPORT_LIMIT,
  SEARCH_DEBOUNCE_MS,
} from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { fetchAllPages, downloadCSV } from '@/lib/csv';
import type { Column } from '@/components/shared/DataTable';
import type { UserListItem } from '@/types/user';

const columns: Column<UserListItem>[] = [
  {
    key: 'user',
    header: 'User',
    render: (row) => (
      <div className="flex items-center gap-3">
        <UserAvatar
          name={row.name}
          email={row.email}
          profilePictureUrl={row.profile_picture_url}
        />
        <span className="text-sm font-medium text-on-surface">{row.name}</span>
      </div>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    render: (row) => (
      <span className="text-sm text-on-surface-variant">{row.email}</span>
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
    key: 'status',
    header: 'Status',
    width: '100px',
    render: (row) => <StatusBadge active={row.premium_entitlement_active} />,
  },
  {
    key: 'joined',
    header: 'Joined',
    width: '120px',
    render: (row) => (
      <span className="text-sm text-on-surface-variant">
        {formatDate(row.created_at)}
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

export function UsersListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const usersQuery = useQuery({
    queryKey: ['users', { page, limit: DEFAULT_LIMIT, search: debouncedSearch }],
    queryFn: () =>
      listUsers({ page, limit: DEFAULT_LIMIT, search: debouncedSearch || undefined }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(DEFAULT_PAGE);
  }

  function handleRowClick(row: UserListItem) {
    void navigate(`/users/${row.id}`);
  }

  async function handleExportCSV() {
    setIsExporting(true);
    try {
      const allUsers = await fetchAllPages(
        (p) => listUsers({ page: p, limit: EXPORT_LIMIT }),
        (res) => ({ items: res.users, total: res.pagination.total }),
      );
      downloadCSV(allUsers, 'pauza_users');
    } catch {
      toast.error('Failed to export users.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-base font-semibold text-on-surface lg:text-lg">Users</h1>

      {usersQuery.error && (
        <ErrorAlert
          message="Failed to load users."
          onRetry={() => { void usersQuery.refetch(); }}
        />
      )}

      <DataTable
        columns={columns}
        data={usersQuery.data?.users ?? []}
        keyExtractor={(row) => row.id}
        pagination={
          usersQuery.data?.pagination ?? { page, limit: DEFAULT_LIMIT, total: 0 }
        }
        onPageChange={setPage}
        onRowClick={handleRowClick}
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by name, email, or username..."
        onExportCSV={() => { void handleExportCSV(); }}
        isExporting={isExporting}
        isLoading={usersQuery.isLoading}
      />
    </div>
  );
}
