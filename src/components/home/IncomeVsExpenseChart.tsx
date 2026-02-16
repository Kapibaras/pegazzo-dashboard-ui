'use client';

import { BarChart3 } from 'lucide-react';
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { formatCurrency } from '@/utils/formatters';

type IncomeVsExpenseChartProps = {
  totalIncome: number;
  totalExpense: number;
};

const chartConfig = {
  amount: {
    label: 'Monto',
  },
  ingresos: {
    label: 'Ingresos',
    color: 'var(--color-success-200)',
  },
  gastos: {
    label: 'Gastos',
    color: 'var(--color-error-200)',
  },
} satisfies ChartConfig;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CategoryLabel = (props: any) => {
  const { x, y, width, height, value } = props as {
    x: number;
    y: number;
    width: number;
    height: number;
    value: string;
  };
  if (!width || width < 60) return null;
  return (
    <text x={x + 12} y={y + height / 2} dy={4} fill="white" className="font-sans text-base font-semibold capitalize">
      {value}
    </text>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AmountLabel = (props: any) => {
  const { x, y, width, height, value } = props as {
    x: number;
    y: number;
    width: number;
    height: number;
    value: number;
  };
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      dy={4}
      fill="var(--color-secondary-500)"
      className="font-numbers text-base"
    >
      {formatCurrency(value)}
    </text>
  );
};

const IncomeVsExpenseChart = ({ totalIncome, totalExpense }: IncomeVsExpenseChartProps) => {
  const isEmpty = totalIncome === 0 && totalExpense === 0;

  const data = [
    { category: 'ingresos', amount: totalIncome, fill: 'url(#gradientIngresos)' },
    { category: 'gastos', amount: totalExpense, fill: 'url(#gradientGastos)' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary-100 flex size-10 items-center justify-center rounded-lg">
            <BarChart3 className="text-primary-600 size-5" />
          </div>
          <CardTitle className="typo-subtitle">Ingresos vs Gastos</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <BarChart3 className="text-accent-300 size-10" />
            <p className="typo-sm-text text-muted-foreground">Sin movimientos en este periodo</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="max-h-[200px] w-full">
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 100 }}>
              <defs>
                <linearGradient id="gradientIngresos" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--color-success-500)" />
                  <stop offset="100%" stopColor="var(--color-success-200)" />
                </linearGradient>
                <linearGradient id="gradientGastos" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--color-error-500)" />
                  <stop offset="100%" stopColor="var(--color-error-200)" />
                </linearGradient>
              </defs>
              <YAxis dataKey="category" type="category" hide />
              <XAxis type="number" hide />
              <ChartTooltip
                animationDuration={100}
                cursor={{ fill: 'var(--color-accent-50)', radius: 8 }}
                content={
                  <ChartTooltipContent
                    className="typo-sm-text"
                    hideLabel
                    formatter={(value) => <span className="typo-numbers">{formatCurrency(value as number)}</span>}
                  />
                }
              />
              <Bar dataKey="amount" radius={8} stroke="none" className="cursor-pointer">
                <LabelList dataKey="category" content={CategoryLabel} />
                <LabelList dataKey="amount" content={AmountLabel} />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeVsExpenseChart;
