import { Download, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PaginationControls } from '@/components/shared/PaginationControls';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  pagination: { page: number; limit: number; total: number };
  onPageChange: (page: number) => void;
  onRowClick?: (row: T) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onExportCSV?: () => void;
  isExporting?: boolean;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  pagination,
  onPageChange,
  onRowClick,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  onExportCSV,
  isExporting,
  isLoading,
}: DataTableProps<T>) {
  const showToolbar = onSearchChange || onExportCSV;

  return (
    <div>
      {showToolbar && (
        <div className={cn(
          'flex items-center gap-4 pb-4',
          onSearchChange && onExportCSV ? 'justify-between' : 'justify-end',
        )}>
          {onSearchChange && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
              <Input
                value={searchValue ?? ''}
                onChange={(e) => { onSearchChange(e.target.value); }}
                placeholder={searchPlaceholder}
                className="w-64 pl-9"
              />
            </div>
          )}

          {onExportCSV && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCSV}
              disabled={isExporting}
            >
              {isExporting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Download className="size-4" />
              )}
              Export CSV
            </Button>
          )}
        </div>
      )}

      <div className="relative overflow-hidden rounded-lg border border-outline-variant">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/60">
            <LoadingSpinner size="lg" />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow className="bg-surface-container hover:bg-surface-container">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  style={column.width ? { width: column.width } : undefined}
                  className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && !isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length}>
                  <EmptyState
                    icon={Search}
                    title="No results found"
                    description="Try adjusting your search or filters"
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={keyExtractor(row)}
                  onClick={onRowClick ? () => { onRowClick(row); } : undefined}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      style={column.width ? { width: column.width } : undefined}
                    >
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        page={pagination.page}
        limit={pagination.limit}
        total={pagination.total}
        onPageChange={onPageChange}
      />
    </div>
  );
}
