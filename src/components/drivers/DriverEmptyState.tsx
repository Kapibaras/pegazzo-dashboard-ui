import Link from 'next/link';
import { IdCard, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type DriverEmptyStateProps = {
  hasFilters: boolean;
  canCreate: boolean;
  onClearFilters: () => void;
};

const DriverEmptyState = ({ hasFilters, canCreate, onClearFilters }: DriverEmptyStateProps) => {
  const Icon = hasFilters ? SearchX : IdCard;

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
        <div className="bg-primary-50 flex size-14 items-center justify-center rounded-full">
          <Icon className="text-primary-700 size-7" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="typo-subtitle text-carbon-500">
            {hasFilters ? 'No hay conductores con esos filtros' : 'Aún no hay conductores registrados'}
          </p>
          <p className="typo-sm-text text-carbon-300">
            {hasFilters
              ? 'Prueba con otra búsqueda o quita algún filtro.'
              : canCreate
                ? 'Registra al primer conductor para empezar.'
                : 'Cuando se registren conductores aparecerán aquí.'}
          </p>
        </div>
        {hasFilters ? (
          <Button variant="outline" className="cursor-pointer" onClick={onClearFilters}>
            Limpiar filtros
          </Button>
        ) : (
          canCreate && (
            <Button asChild className="bg-terciary-500 text-primary-100 hover:bg-primary-800 cursor-pointer">
              <Link href="/conductores/nuevo">Agregar conductor</Link>
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default DriverEmptyState;
