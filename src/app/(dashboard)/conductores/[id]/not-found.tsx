import Link from 'next/link';
import { IdCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const DriverNotFound = () => (
  <Card>
    <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
      <div className="bg-primary-50 flex size-14 items-center justify-center rounded-full">
        <IdCard className="text-primary-700 size-7" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="typo-subtitle text-carbon-500">Conductor no encontrado</p>
        <p className="typo-sm-text text-carbon-300">
          Puede que el folio sea incorrecto o que el conductor se haya eliminado.
        </p>
      </div>
      <Button asChild className="bg-terciary-500 text-primary-100 hover:bg-primary-800 cursor-pointer">
        <Link href="/conductores">Volver al listado</Link>
      </Button>
    </CardContent>
  </Card>
);

export default DriverNotFound;
