'use client';

import { Calculator, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatters';
import { WeeklyAverages } from '@/types/balance';

type FinancialSummaryProps = {
  weeklyAverages: WeeklyAverages;
  incomeExpenseRatio: number;
};

const getRatioBadge = (ratio: number, income: number, expense: number) => {
  if (income === 0 && expense === 0) {
    return { label: 'N/A', className: 'bg-muted text-muted-foreground' };
  }
  if (expense === 0) {
    return { label: 'Positivo', className: 'bg-success-50 text-success-400' };
  }
  if (ratio >= 1.05) {
    return { label: 'Situación positiva', className: 'bg-success-50 text-success-400' };
  }
  if (ratio >= 0.95) {
    return { label: 'Punto de equilibrio', className: 'bg-accent-50 text-accent-400' };
  }
  return { label: 'Situación negativa', className: 'bg-error-50 text-error-400' };
};

const FinancialSummary = ({ weeklyAverages, incomeExpenseRatio }: FinancialSummaryProps) => {
  const badge = getRatioBadge(incomeExpenseRatio, weeklyAverages.income, weeklyAverages.expense);
  const ratioDisplay =
    weeklyAverages.income === 0 && weeklyAverages.expense === 0 ? 'N/A' : incomeExpenseRatio.toFixed(2);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary-100 flex size-10 items-center justify-center rounded-lg">
            <Calculator className="text-primary-600 size-5" />
          </div>
          <CardTitle className="typo-subtitle">Resumen financiero</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center gap-2">
              <div className="bg-success-50 flex size-7 items-center justify-center rounded-md">
                <TrendingUp className="text-success-400 size-4" />
              </div>
              <span className="typo-bold-text">Promedio semanal ingresos</span>
            </div>
            <span className="font-numbers text-2xl font-semibold tracking-tight">
              {formatCurrency(weeklyAverages.income)}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-1.5">
              <span className="typo-bold-text">Relación ingresos/gastos</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="text-muted-foreground size-4 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  Mayor a 1 → más ingresos que gastos. <br />
                  Menor a 1 → más gastos que ingresos.
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="font-numbers text-4xl font-semibold tracking-tight">{ratioDisplay}</span>
            <span className={cn('rounded-full px-3 py-1 text-xs font-medium', badge.className)}>{badge.label}</span>
          </div>

          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center gap-2">
              <div className="bg-error-50 flex size-7 items-center justify-center rounded-md">
                <TrendingDown className="text-error-400 size-4" />
              </div>
              <span className="typo-bold-text">Promedio semanal gastos</span>
            </div>
            <span className="font-numbers text-2xl font-semibold tracking-tight">
              {formatCurrency(weeklyAverages.expense)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSummary;
