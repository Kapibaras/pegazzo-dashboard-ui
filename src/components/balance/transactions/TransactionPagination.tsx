'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TransactionPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
};

const getPageNumbers = (current: number, total: number): (number | 'ellipsis')[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('ellipsis');
  }

  pages.push(total);

  return pages;
};

const TransactionPagination = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  isLoading,
}: TransactionPaginationProps) => {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="typo-sm-text text-muted-foreground font-numbers">
        Mostrando {start}-{end} de {total} transacciones
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pageNumbers.map((num, idx) =>
          num === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="font-numbers text-muted-foreground px-1 text-sm">
              ...
            </span>
          ) : (
            <Button
              key={num}
              variant="ghost"
              size="icon"
              className={cn(
                'font-numbers h-8 w-8 cursor-pointer text-sm',
                num === page && 'bg-primary-500 hover:bg-primary-500 text-white hover:text-white',
              )}
              disabled={isLoading}
              onClick={() => onPageChange(num)}
            >
              {num}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          disabled={page >= totalPages || isLoading}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TransactionPagination;
