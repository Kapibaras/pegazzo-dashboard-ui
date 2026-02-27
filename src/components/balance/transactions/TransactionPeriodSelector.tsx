'use client';

import { useState, useCallback, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MONTH_NAMES } from '@/lib/balance';
import {
  getAvailableYears,
  getAvailableMonths,
  TRANSACTION_PERIOD_OPTIONS,
  TransactionPeriodType,
} from '@/lib/transaction';
import { type PeriodParams } from '@/hooks/transactions/useTransactions';

type TransactionPeriodSelectorProps = {
  periodType: TransactionPeriodType;
  year: number;
  month: number;
  onPeriodChange: (params: PeriodParams) => void;
};

const TransactionPeriodSelector = ({ periodType, year, month, onPeriodChange }: TransactionPeriodSelectorProps) => {
  const [localPeriod, setLocalPeriod] = useState<TransactionPeriodType>(periodType);
  const [localYear, setLocalYear] = useState(year);
  const [localMonth, setLocalMonth] = useState(month);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const years = getAvailableYears();
  const months = getAvailableMonths(localYear);

  const emitChange = useCallback(
    (period: TransactionPeriodType, y: number, m: number) => {
      const params: PeriodParams = { period, year: y };
      if (period === 'month') {
        params.month = m;
      }
      onPeriodChange(params);
    },
    [onPeriodChange],
  );

  const handlePeriodChange = useCallback(
    (value: string) => {
      const newPeriod = value as TransactionPeriodType;
      setLocalPeriod(newPeriod);
      setLocalYear(currentYear);
      setLocalMonth(currentMonth);
      emitChange(newPeriod, currentYear, currentMonth);
    },
    [currentYear, currentMonth, emitChange],
  );

  const handleYearChange = useCallback(
    (value: string) => {
      const newYear = Number(value);
      const availableMonths = getAvailableMonths(newYear);
      const newMonth = availableMonths.includes(localMonth) ? localMonth : availableMonths[availableMonths.length - 1];

      setLocalYear(newYear);
      setLocalMonth(newMonth);
      emitChange(localPeriod, newYear, newMonth);
    },
    [localMonth, localPeriod, emitChange],
  );

  const handleMonthChange = useCallback(
    (value: string) => {
      const newMonth = Number(value);
      setLocalMonth(newMonth);
      emitChange(localPeriod, localYear, newMonth);
    },
    [localPeriod, localYear, emitChange],
  );

  useEffect(() => {
    setLocalPeriod(periodType);
    setLocalYear(year);
    setLocalMonth(month);
  }, [periodType, year, month]);

  const triggerClassName =
    'cursor-pointer border-primary-200/40 bg-primary-50/40 text-primary-800 font-medium shadow-sm transition-all hover:bg-primary-100/60 hover:border-primary-300/50 focus:ring-primary-400/30 data-[state=open]:bg-primary-100/60 data-[state=open]:border-primary-400/50';

  const itemClassName = 'cursor-pointer font-medium text-primary-800 focus:bg-primary-100/60 focus:text-primary-900';

  return (
    <div className="flex items-center gap-2 rounded-xl bg-primary-100/30 px-2.5 py-1.5">
      <CalendarDays className="h-4 w-4 shrink-0 text-primary-600" />

      <div className="flex flex-wrap items-center gap-2">
        <Select value={localPeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger size="sm" className={triggerClassName}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TRANSACTION_PERIOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className={itemClassName}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(localYear)} onValueChange={handleYearChange}>
          <SelectTrigger size="sm" className={triggerClassName}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)} className={itemClassName}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {localPeriod === 'month' && (
          <Select value={String(localMonth)} onValueChange={handleMonthChange}>
            <SelectTrigger size="sm" className={triggerClassName}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={String(m)} className={itemClassName}>
                  {MONTH_NAMES[m - 1]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

export default TransactionPeriodSelector;
