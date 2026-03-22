import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationControlsProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  page,
  limit,
  total,
  onPageChange,
}: PaginationControlsProps) {
  const totalPages = Math.ceil(total / limit);
  const rangeStart = (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);
  const isFirstPage = page === 1;
  const isLastPage = page * limit >= total;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-1">
        <span className="text-sm text-on-surface-variant">No results</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm tabular-nums text-on-surface-variant">
        Showing{' '}
        <span className="font-medium text-on-surface">
          {String(rangeStart)}&ndash;{String(rangeEnd)}
        </span>{' '}
        of{' '}
        <span className="font-medium text-on-surface">{String(total)}</span>
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={isFirstPage}
            onClick={() => {
              onPageChange(page - 1);
            }}
            aria-label="Previous page"
            className={cn(
              'border-outline-variant/60 transition-colors duration-150',
              isFirstPage && 'opacity-40',
            )}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[5.5rem] text-center text-sm tabular-nums text-on-surface-variant">
            Page{' '}
            <span className="font-medium text-on-surface">{page}</span> of{' '}
            <span className="font-medium text-on-surface">{totalPages}</span>
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={isLastPage}
            onClick={() => {
              onPageChange(page + 1);
            }}
            aria-label="Next page"
            className={cn(
              'border-outline-variant/60 transition-colors duration-150',
              isLastPage && 'opacity-40',
            )}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
