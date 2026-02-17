import { ArrowRightLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TransactionCounterProps = {
  count: number;
};

const TransactionCounter = ({ count }: TransactionCounterProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary-100">
            <ArrowRightLeft className="size-5 text-primary-600" />
          </div>
          <CardTitle className="typo-subtitle">Transacciones del Mes</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <span className="font-numbers text-4xl font-semibold tracking-tight">{count}</span>
      </CardContent>
    </Card>
  );
};

export default TransactionCounter;
