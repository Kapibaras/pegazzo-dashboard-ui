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
          <div className="bg-primary-100 flex size-10 items-center justify-center rounded-lg">
            <ArrowRightLeft className="text-primary-600 size-5" />
          </div>
          <CardTitle className="typo-subtitle">Transacciones del Mes</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <span className="typo-kpi">{count}</span>
      </CardContent>
    </Card>
  );
};

export default TransactionCounter;
