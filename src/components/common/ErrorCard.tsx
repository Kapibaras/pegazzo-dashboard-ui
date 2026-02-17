// Reusable error card for client-side operations (fetch, server actions, etc.)
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type ErrorCardProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

const ErrorCard = ({ title = 'Algo salió mal', message, onRetry }: ErrorCardProps) => {
  return (
    <Card className="border-error-100">
      <CardContent className="flex flex-col items-center gap-4 py-10">
        <div className="flex size-12 items-center justify-center rounded-full bg-error-50">
          <AlertCircle className="size-6 text-error-400" />
        </div>
        <div className="space-y-1 text-center">
          <p className="typo-subtitle">{title}</p>
          <p className="typo-sm-text text-muted-foreground">{message}</p>
        </div>
        {onRetry && (
          <Button
            onClick={onRetry}
            className="bg-terciary-500 hover:bg-primary-700 text-primary-100 typo-bold-text mt-2 cursor-pointer rounded-md px-12 py-5.5 hover:shadow-sm"
          >
            <RefreshCw className="size-4" />
            Reintentar
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorCard;
