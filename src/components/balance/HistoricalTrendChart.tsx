'use client';

import { TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip } from '@/components/ui/chart';
import { formatTrendLabel } from '@/lib/balance';
import { formatCurrency } from '@/utils/formatters';
import { BalancePeriodType, BalanceTrendDataPoint } from '@/types/balance';

type HistoricalTrendChartProps = {
  data: BalanceTrendDataPoint[];
  period: BalancePeriodType;
};

const chartConfig = {
  totalIncome: { label: 'Ingresos', color: 'var(--color-success-400)' },
  totalExpense: { label: 'Gastos', color: 'var(--color-error-400)' },
} satisfies ChartConfig;

const HistoricalTrendChart = ({ data, period }: HistoricalTrendChartProps) => {
  const chartData = data.map((point) => ({
    ...point,
    label: formatTrendLabel(point.periodStart, period),
  }));

  const hasData = data.length > 0;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary-100">
            <TrendingUp className="size-5 text-primary-600" />
          </div>
          <CardTitle className="typo-subtitle">Tendencia histórica</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {hasData ? (
          <ChartContainer config={chartConfig} className="aspect-auto min-h-[280px] w-full flex-1">
            <LineChart data={chartData} margin={{ left: 12, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => formatCurrency(v)} />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="border-border/50 bg-background rounded-lg border px-3 py-2 text-xs shadow-xl">
                      <p className="mb-1.5 font-medium">{label}</p>
                      {payload.map((entry) => (
                        <div key={entry.dataKey} className="flex items-center gap-2">
                          <div
                            className="size-2.5 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-muted-foreground">{entry.name}</span>
                          <span className="font-numbers ml-auto font-medium">
                            {formatCurrency(entry.value as number)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="totalIncome"
                name="Ingresos"
                stroke="var(--color-totalIncome)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="totalExpense"
                name="Gastos"
                stroke="var(--color-totalExpense)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex min-h-[280px] flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
            <TrendingUp className="size-10 opacity-30" />
            <p className="typo-text">Sin datos históricos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricalTrendChart;
