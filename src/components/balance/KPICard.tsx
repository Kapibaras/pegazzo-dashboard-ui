import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatPercent } from '@/utils/formatters';

type KPICardProps = {
  icon: LucideIcon;
  title: string;
  value: string;
  change?: {
    value: number;
    type: 'percent' | 'absolute';
  };
  iconColorClass?: string;
  iconBgClass?: string;
};

const KPICard = ({
  icon: Icon,
  title,
  value,
  change,
  iconColorClass = 'text-primary-600',
  iconBgClass = 'bg-primary-100',
}: KPICardProps) => {
  const getChangeColor = (val: number) => {
    if (val > 0) return 'text-success-400';
    if (val < 0) return 'text-error-400';
    return 'text-accent-400';
  };

  const getChangeIcon = (val: number) => {
    if (val > 0) return TrendingUp;
    if (val < 0) return TrendingDown;
    return Minus;
  };

  const formatChange = (change: { value: number; type: 'percent' | 'absolute' }) => {
    if (change.type === 'percent') return formatPercent(change.value);
    const prefix = change.value > 0 ? '+' : '';
    return `${prefix}${change.value}`;
  };

  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={cn('flex size-10 items-center justify-center rounded-lg', iconBgClass)}>
            <Icon className={cn('size-5', iconColorClass)} />
          </div>
          <CardTitle className="typo-subtitle">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-1">
          <span className="font-numbers text-4xl font-semibold tracking-tight">{value}</span>
          {change && (
            <div className={cn('flex items-center gap-1', getChangeColor(change.value))}>
              {(() => {
                const ChangeIcon = getChangeIcon(change.value);
                return <ChangeIcon className="size-3.5" />;
              })()}
              <span className="font-numbers text-sm">{formatChange(change)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;
