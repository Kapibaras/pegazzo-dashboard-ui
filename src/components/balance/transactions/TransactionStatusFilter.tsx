'use client';

import { Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { TransactionStatus } from '@/types/transaction';
import { TRANSACTION_STATUS_LABELS } from '@/lib/transaction';

const ALL_VALUE = '__all__';

type FilterOption = {
  value: TransactionStatus | typeof ALL_VALUE;
  label: string;
};

const OPTIONS: FilterOption[] = [
  { value: ALL_VALUE, label: 'Todos' },
  { value: 'PENDING', label: TRANSACTION_STATUS_LABELS.PENDING },
  { value: 'CONFIRMED', label: TRANSACTION_STATUS_LABELS.CONFIRMED },
  { value: 'REJECTED', label: TRANSACTION_STATUS_LABELS.REJECTED },
];

type TransactionStatusFilterProps = {
  value: TransactionStatus | undefined;
  onChange: (status: TransactionStatus | undefined) => void;
};

const TransactionStatusFilter = ({ value, onChange }: TransactionStatusFilterProps) => {
  const selectValue = value ?? ALL_VALUE;

  const handleChange = (val: string) => {
    onChange(val === ALL_VALUE ? undefined : (val as TransactionStatus));
  };

  return (
    <div className="flex items-center gap-2 rounded-xl bg-primary-100/30 px-2.5 py-1.5">
      <Filter className="h-4 w-4 shrink-0 text-primary-600" />
      <Select value={selectValue} onValueChange={handleChange}>
        <SelectTrigger
          size="sm"
          className={cn(
            'cursor-pointer border-primary-200/40 bg-primary-50/40 font-medium shadow-sm transition-all',
            'hover:bg-primary-100/60 hover:border-primary-300/50 focus:ring-primary-400/30',
            'data-[state=open]:bg-primary-100/60 data-[state=open]:border-primary-400/50',
            'text-primary-800',
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="cursor-pointer font-medium text-primary-800 focus:bg-primary-100/60 focus:text-primary-900"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TransactionStatusFilter;
