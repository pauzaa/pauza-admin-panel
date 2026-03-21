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

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 pt-4',
        'sm:flex-row sm:justify-between sm:gap-0',
      )}
    >
      <span
        className={cn(
          'text-sm text-on-surface-variant',
          total > 0 && 'hidden sm:inline',
        )}
      >
        {total === 0
          ? 'No results'
          : `Showing ${String(rangeStart)}–${String(rangeEnd)} of ${String(total)}`}
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={isFirstPage}
            onClick={() => { onPageChange(page - 1); }}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-on-surface-variant">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={isLastPage}
            onClick={() => { onPageChange(page + 1); }}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
