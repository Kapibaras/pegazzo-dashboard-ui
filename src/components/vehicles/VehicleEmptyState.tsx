import Link from 'next/link';
import { CarFront, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type VehicleEmptyStateProps = {
  hasFilters: boolean;
  canCreate: boolean;
  onClearFilters: () => void;
};

const VehicleEmptyState = ({ hasFilters, canCreate, onClearFilters }: VehicleEmptyStateProps) => {
  const Icon = hasFilters ? SearchX : CarFront;

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
        <div className="bg-primary-50 flex size-14 items-center justify-center rounded-full">
          <Icon className="text-primary-700 size-7" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="typo-subtitle text-carbon-500">
            {hasFilters ? 'No hay coches con esos filtros' : 'Aún no hay coches registrados'}
          </p>
          <p className="typo-sm-text text-carbon-300">
            {hasFilters
              ? 'Prueba con otra búsqueda o quita algún filtro.'
              : canCreate
                ? 'Registra el primer vehículo de la flota para empezar.'
                : 'Cuando se registren vehículos aparecerán aquí.'}
          </p>
        </div>
        {hasFilters ? (
          <Button variant="outline" className="cursor-pointer" onClick={onClearFilters}>
            Limpiar filtros
          </Button>
        ) : (
          canCreate && (
            <Button asChild className="bg-terciary-500 text-primary-100 hover:bg-primary-800 cursor-pointer">
              <Link href="/coches/nuevo">Agregar coche</Link>
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default VehicleEmptyState;
