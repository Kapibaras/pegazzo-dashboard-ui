import { Wallet, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/formatters';

type MonthlyBalanceCardProps = {
  balance: number;
};

const MonthlyBalanceCard = ({ balance }: MonthlyBalanceCardProps) => {
  const isPositive = balance > 0;
  const isNegative = balance < 0;

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  const colorClass = isPositive ? 'text-success-400' : isNegative ? 'text-error-400' : 'text-accent-400';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary-100">
            <Wallet className="size-5 text-primary-600" />
          </div>
          <CardTitle className="typo-subtitle">Balance del Mes</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className={cn('font-numbers text-4xl font-semibold tracking-tight', colorClass)}>
            {formatCurrency(balance)}
          </span>
          <TrendIcon className={cn('size-5 self-center', colorClass)} />
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyBalanceCard;
