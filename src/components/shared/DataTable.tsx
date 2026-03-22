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
  data: readonly T[];
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
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
      {showToolbar && (
        <div
          className={cn(
            'flex items-center gap-3 border-b border-outline-variant/50 px-5 py-3.5',
            onSearchChange && onExportCSV
              ? 'justify-between'
              : onSearchChange
                ? 'justify-start'
                : 'justify-end',
          )}
        >
          {onSearchChange && (
            <div className="relative w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant/70" />
              <Input
                value={searchValue ?? ''}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                }}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-lg border-outline-variant/60 bg-surface-container-low pl-9 text-sm placeholder:text-on-surface-variant/50 focus:border-primary/40 focus:ring-primary/15"
              />
            </div>
          )}

          {onExportCSV && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCSV}
              disabled={isExporting}
              className="gap-2 border-outline-variant/60 text-on-surface-variant transition-colors duration-150 hover:text-on-surface"
            >
              {isExporting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Download className="size-3.5" />
              )}
              Export CSV
            </Button>
          )}
        </div>
      )}

      <div className="relative overflow-x-auto">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/70 backdrop-blur-sm transition-opacity duration-200">
            <LoadingSpinner size="lg" />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow className="border-b border-outline-variant/50 bg-surface-container-high hover:bg-surface-container-high">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  style={column.width ? { width: column.width } : undefined}
                  className="h-10 px-5 text-[0.6875rem] font-semibold uppercase tracking-widest text-on-surface-variant"
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(() => {
              if (data.length === 0 && !isLoading) {
                return (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={columns.length} className="py-6">
                      <EmptyState
                        icon={Search}
                        title="No results found"
                        description="Try adjusting your search or filters"
                      />
                    </TableCell>
                  </TableRow>
                );
              }
              const rowClassName = cn(
                'border-b border-outline-variant/30 transition-colors duration-150 last:border-b-0',
                onRowClick && 'cursor-pointer hover:bg-surface-container-low',
              );
              return data.map((row) => (
                <TableRow
                  key={keyExtractor(row)}
                  onClick={
                    onRowClick
                      ? () => {
                          onRowClick(row);
                        }
                      : undefined
                  }
                  className={rowClassName}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      style={
                        column.width ? { width: column.width } : undefined
                      }
                      className="px-5"
                    >
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ));
            })()}
          </TableBody>
        </Table>
      </div>

      <div className="border-t border-outline-variant/50 px-5 py-3">
        <PaginationControls
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
