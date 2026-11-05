'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type ListPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  /** Page sizes offered in the selector. */
  limitOptions: readonly number[];
  /** Plural noun of the listed records, e.g. "coches". */
  noun: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading: boolean;
};

const getPageNumbers = (current: number, total: number): (number | 'ellipsis')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
};

const ListPagination = ({
  page,
  totalPages,
  total,
  limit,
  limitOptions,
  noun,
  onPageChange,
  onLimitChange,
  isLoading,
}: ListPaginationProps) => {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <nav
      aria-label={`Paginación de ${noun}`}
      className="bg-primary-100/20 flex flex-col items-center justify-between gap-3 rounded-xl px-4 py-2.5 sm:flex-row"
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="typo-label text-primary-800 whitespace-nowrap">Por página:</span>
          <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
            <SelectTrigger
              size="sm"
              className="border-primary-200/40 bg-primary-50/40 text-primary-800 hover:bg-primary-100/60 w-[70px] cursor-pointer font-medium shadow-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {limitOptions.map((option) => (
                <SelectItem
                  key={option}
                  value={String(option)}
                  className="text-primary-800 focus:bg-primary-100/60 cursor-pointer font-medium"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="typo-label font-numbers text-primary-800">
          Mostrando {start}-{end} de {total} {noun}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Página anterior"
          className="text-primary-700 hover:bg-primary-200/40 disabled:text-primary-300 h-8 w-8 cursor-pointer"
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pageNumbers.map((num, index) =>
          num === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="typo-sm-text font-numbers text-primary-400 px-1">
              ...
            </span>
          ) : (
            <Button
              key={num}
              variant="ghost"
              size="icon"
              aria-current={num === page ? 'page' : undefined}
              className={cn(
                'typo-label font-numbers h-8 w-8 cursor-pointer',
                num === page
                  ? 'bg-primary-700 hover:bg-primary-700 text-white shadow-md hover:text-white'
                  : 'text-primary-700 hover:bg-primary-200/40',
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
          aria-label="Página siguiente"
          className="text-primary-700 hover:bg-primary-200/40 disabled:text-primary-300 h-8 w-8 cursor-pointer"
          disabled={page >= totalPages || isLoading}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
};

export default ListPagination;
