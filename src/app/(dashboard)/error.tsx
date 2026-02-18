'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, RefreshCw, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const isForbidden = (error: Error) => {
  return error.message?.includes('Forbidden') || error.message?.includes('403');
};

const DashboardError = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  const router = useRouter();
  const forbidden = isForbidden(error);

  const handleRetry = () => {
    router.refresh();
    reset();
  };

  return (
    <div className="flex h-full items-center justify-center p-6">
      {forbidden ? (
        <Card className="border-error-100 w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <div className="flex size-12 items-center justify-center rounded-full bg-error-50">
              <ShieldX className="size-6 text-error-400" />
            </div>
            <div className="space-y-1 text-center">
              <p className="typo-subtitle">Acceso denegado</p>
              <p className="typo-sm-text text-muted-foreground">No tienes permisos para acceder a esta seccion.</p>
            </div>
            <Button
              asChild
              className="bg-terciary-500 hover:bg-primary-700 text-primary-100 typo-bold-text mt-2 cursor-pointer rounded-md px-12 py-5.5 hover:shadow-sm"
            >
              <Link href="/">Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-error-100 w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <div className="flex size-12 items-center justify-center rounded-full bg-error-50">
              <AlertCircle className="size-6 text-error-400" />
            </div>
            <div className="space-y-1 text-center">
              <p className="typo-subtitle">Algo salio mal</p>
              <p className="typo-sm-text text-muted-foreground">
                Ocurrio un error inesperado. Por favor, intenta de nuevo.
              </p>
            </div>
            <Button
              onClick={handleRetry}
              className="bg-terciary-500 hover:bg-primary-700 text-primary-100 typo-bold-text mt-2 cursor-pointer rounded-md px-12 py-5.5 hover:shadow-sm"
            >
              <RefreshCw className="size-4" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardError;
