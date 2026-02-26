import { CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_COLORS } from '@/lib/balance';
import { formatCurrency } from '@/utils/formatters';
import { PaymentMethodBreakdownByType } from '@/types/balance';

type PaymentMethodBreakdownProps = {
  breakdown: PaymentMethodBreakdownByType;
};

type MethodBarProps = {
  method: string;
  amount: number;
  maxAmount: number;
};

const MethodBar = ({ method, amount, maxAmount }: MethodBarProps) => {
  const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
  const color = PAYMENT_METHOD_COLORS[method] ?? 'var(--color-muted-foreground)';
  const label = PAYMENT_METHOD_LABELS[method] ?? method;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="typo-sm-text text-muted-foreground">{label}</span>
        <span className="font-numbers text-sm font-medium">{formatCurrency(amount)}</span>
      </div>
      <div className="bg-muted h-2 overflow-hidden rounded-full">
        <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

const PAYMENT_METHODS = ['cash', 'personal_transfer', 'pegazzo_transfer'];

const PaymentMethodBreakdown = ({ breakdown }: PaymentMethodBreakdownProps) => {
  const creditMax = Math.max(...PAYMENT_METHODS.map((m) => breakdown.credit.amounts[m] ?? 0), 1);
  const debitMax = Math.max(...PAYMENT_METHODS.map((m) => breakdown.debit.amounts[m] ?? 0), 1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary-100">
            <CreditCard className="size-5 text-primary-600" />
          </div>
          <CardTitle className="typo-subtitle">Desglose por método de pago</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-success-50">
                <TrendingUp className="size-4 text-success-400" />
              </div>
              <h4 className="typo-bold-text">Ingresos</h4>
            </div>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <MethodBar
                  key={method}
                  method={method}
                  amount={breakdown.credit.amounts[method] ?? 0}
                  maxAmount={creditMax}
                />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-error-50">
                <TrendingDown className="size-4 text-error-400" />
              </div>
              <h4 className="typo-bold-text">Gastos</h4>
            </div>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <MethodBar
                  key={method}
                  method={method}
                  amount={breakdown.debit.amounts[method] ?? 0}
                  maxAmount={debitMax}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodBreakdown;
