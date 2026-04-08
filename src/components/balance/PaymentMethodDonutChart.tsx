'use client';

import { PieChart as PieChartIcon, TrendingUp, TrendingDown, Wallet, type LucideIcon } from 'lucide-react';
import { Pie, PieChart, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_COLORS } from '@/lib/balance';
import { formatCurrency } from '@/utils/formatters';
import { PaymentMethodBreakdown } from '@/types/balance';

type PaymentMethodDonutChartProps = {
  credit: PaymentMethodBreakdown;
  debit: PaymentMethodBreakdown;
  balance: PaymentMethodBreakdown;
};

const PAYMENT_METHODS = ['cash', 'personal_transfer', 'pegazzo_transfer'];

const chartConfig = Object.fromEntries(
  PAYMENT_METHODS.map((method) => [
    method,
    { label: PAYMENT_METHOD_LABELS[method], color: PAYMENT_METHOD_COLORS[method] },
  ]),
) satisfies ChartConfig;

const buildPieData = (breakdown: PaymentMethodBreakdown, absValues = false) =>
  PAYMENT_METHODS.map((method) => {
    const raw = breakdown.amounts[method] ?? 0;
    return {
      name: PAYMENT_METHOD_LABELS[method] ?? method,
      method,
      value: absValues ? Math.abs(raw) : raw,
      rawValue: raw,
      percentage: breakdown.percentages[method] ?? 0,
      fill: PAYMENT_METHOD_COLORS[method] ?? 'var(--color-muted-foreground)',
    };
  });

const hasValues = (breakdown: PaymentMethodBreakdown) =>
  PAYMENT_METHODS.some((m) => Math.abs(breakdown.amounts[m] ?? 0) > 0);

type DonutSectionProps = {
  title: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  breakdown: PaymentMethodBreakdown;
  absValues?: boolean;
};

const DonutSection = ({ title, icon: Icon, iconBg, iconColor, breakdown, absValues }: DonutSectionProps) => {
  const data = buildPieData(breakdown, absValues);
  const empty = !hasValues(breakdown);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <div className={`flex size-7 items-center justify-center rounded-md ${iconBg}`}>
          <Icon className={`size-4 ${iconColor}`} />
        </div>
        <h4 className="typo-bold-text">{title}</h4>
      </div>
      {empty ? (
        <div className="flex h-[180px] items-center justify-center">
          <p className="typo-sm-text text-muted-foreground">Sin datos</p>
        </div>
      ) : (
        <>
          <ChartContainer config={chartConfig} className="aspect-square h-[180px]">
            <PieChart>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const entry = payload[0].payload;
                  return (
                    <div className="border-border/50 bg-background rounded-lg border px-3 py-2 text-xs shadow-xl">
                      <div className="flex items-center gap-2">
                        <div className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: entry.fill }} />
                        <span className="font-medium">{entry.name}</span>
                      </div>
                      <div className="text-muted-foreground mt-1">
                        <span className="font-numbers">{formatCurrency(entry.rawValue ?? entry.value)}</span>
                        <span className="ml-1">({entry.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} strokeWidth={2}>
                {data.map((entry) => (
                  <Cell key={entry.method} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="flex flex-wrap justify-center gap-3">
            {data.map((entry) => (
              <div key={entry.method} className="flex items-center gap-1.5 text-xs">
                <div className="size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: entry.fill }} />
                <span className="text-muted-foreground">{entry.name}</span>
                <span className="font-numbers font-medium">{entry.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const PaymentMethodDonutChart = ({ credit, debit, balance }: PaymentMethodDonutChartProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary-100">
            <PieChartIcon className="size-5 text-primary-600" />
          </div>
          <CardTitle className="typo-subtitle">Distribución por método de pago</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-3">
          <DonutSection title="Ingresos" icon={TrendingUp} iconBg="bg-success-50" iconColor="text-success-400" breakdown={credit} />
          <DonutSection title="Gastos" icon={TrendingDown} iconBg="bg-error-50" iconColor="text-error-400" breakdown={debit} />
          <DonutSection title="Balance" icon={Wallet} iconBg="bg-chart-4/15" iconColor="text-chart-4" breakdown={balance} absValues />
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodDonutChart;
