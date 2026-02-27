'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { LIMIT_OPTIONS } from '@/lib/transaction';

type TransactionPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
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
  onLimitChange,
  isLoading,
}: TransactionPaginationProps) => {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="bg-primary-100/20 flex flex-col items-center justify-between gap-3 rounded-xl px-4 py-2.5 sm:flex-row">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="typo-sm-text text-primary-800 font-medium whitespace-nowrap">Filas por página:</span>
          <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
            <SelectTrigger
              size="sm"
              className="border-primary-200/40 bg-primary-50/40 text-primary-800 hover:border-primary-300/50 hover:bg-primary-100/60 data-[state=open]:border-primary-400/50 data-[state=open]:bg-primary-100/60 w-[70px] cursor-pointer font-medium shadow-sm transition-all"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIMIT_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt}
                  value={String(opt)}
                  className="text-primary-800 focus:bg-primary-100/60 focus:text-primary-900 cursor-pointer font-medium"
                >
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="typo-sm-text font-numbers text-primary-800 font-medium">
          Mostrando {start}-{end} de {total} transacciones
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-700 hover:bg-primary-200/40 hover:text-primary-900 disabled:text-primary-300 h-8 w-8 cursor-pointer transition-all"
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pageNumbers.map((num, idx) =>
          num === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="font-numbers text-primary-400 px-1 text-sm">
              ...
            </span>
          ) : (
            <Button
              key={num}
              variant="ghost"
              size="icon"
              className={cn(
                'font-numbers h-8 w-8 cursor-pointer text-sm font-semibold transition-all',
                num === page
                  ? 'bg-primary-700 hover:bg-primary-700 text-white shadow-md hover:text-white'
                  : 'text-primary-700 hover:bg-primary-200/40 hover:text-primary-900',
              )}
              disabled={isLoading}
              onClick={() => onPageChange(num)}
            >
              {num}
            </Button>
          ),
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-700 hover:bg-primary-200/40 hover:text-primary-900 disabled:text-primary-300 h-8 w-8 cursor-pointer transition-all"
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
