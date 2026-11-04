'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CarFront, ChevronRight, PlusCircle, Search, UserRoundX, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreateAssociateDialog } from '@/components/vehicles/QuickCreateDialogs';
import VehicleStatCard from '@/components/vehicles/VehicleStatCard';
import { BUTTON_ICON_CLASS, primaryButton } from '@/lib/buttonStyles';
import { searchFieldClass } from '@/lib/formField';
import { cn } from '@/lib/utils';
import { Associate } from '@/types/vehicle';
import AssociateSheet from './AssociateSheet';

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const getInitials = (name: string, surnames: string) =>
  `${name.trim().charAt(0)}${surnames.trim().charAt(0)}`.toUpperCase();

const HEAD_CLASS = 'typo-bold-text text-primary-100 px-5 py-3.5';

/**
 * The list arrives already fetched by the server page; search runs here (the catalog is small and the backend does
 * not paginate it). Edit/delete go through server actions that revalidate `/socios`, and `router.refresh()` pulls the
 * fresh list after a create.
 */
const AssociatesView = ({ associates }: { associates: Associate[] }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return associates;
    return associates.filter((associate) => normalize(`${associate.name} ${associate.surnames}`).includes(term));
  }, [associates, search]);

  const total = associates.length;
  const totalCars = associates.reduce((sum, associate) => sum + (associate.car_count ?? 0), 0);
  const withoutCars = associates.filter((associate) => !associate.car_count).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="typo-title text-carbon-500">Socios</h1>
          <p className="typo-text text-carbon-300">
            Dueños de los coches de la flota y los coches que tienen asociados.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className={primaryButton()}>
          <PlusCircle className={BUTTON_ICON_CLASS} aria-hidden />
          Agregar socio
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <VehicleStatCard
          icon={UsersRound}
          label="Socios"
          value={total}
          hint={total === 1 ? 'registrado' : 'registrados'}
          chipClassName="bg-primary-100 text-primary-800"
        />
        <VehicleStatCard
          icon={CarFront}
          label="Coches asociados"
          value={totalCars}
          hint="entre todos los socios"
          chipClassName="bg-success-50 text-success-700"
        />
        <VehicleStatCard
          icon={UserRoundX}
          label="Sin coches"
          value={withoutCars}
          hint={withoutCars === 0 ? 'todos tienen coches' : 'se pueden eliminar'}
          chipClassName="bg-warning-100 text-warning-700"
        />
      </div>

      <div className="relative w-full max-w-md">
        <Search className="text-carbon-200 absolute top-1/2 left-4 size-4 -translate-y-1/2" aria-hidden />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar socio..."
          aria-label="Buscar socio"
          className={searchFieldClass()}
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="bg-primary-50 flex size-14 items-center justify-center rounded-full">
              <UsersRound className="text-primary-700 size-7" aria-hidden />
            </div>
            <p className="typo-subtitle text-carbon-500">
              {total === 0 ? 'Aún no hay socios registrados' : 'No hay socios con esa búsqueda'}
            </p>
            <p className="typo-sm-text text-carbon-300">
              {total === 0 ? 'Agrega el primero o créalo al registrar un coche.' : 'Prueba con otro nombre.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border-surface-700/25 min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm">
          <Table>
            <TableHeader className="border-primary-700/20 from-secondary-500 to-secondary-600 border-b bg-gradient-to-b">
              <TableRow className="hover:bg-transparent">
                <TableHead className={HEAD_CLASS}>Socio</TableHead>
                <TableHead className={cn(HEAD_CLASS, 'hidden md:table-cell')}>Teléfonos</TableHead>
                <TableHead className={cn(HEAD_CLASS, 'text-right')}>Coches</TableHead>
                <TableHead className="w-12 px-3">
                  <span className="sr-only">Ver detalle</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((associate) => {
                const carCount = associate.car_count ?? 0;
                const phones = associate.telephones ?? [];
                return (
                  <TableRow
                    key={associate.id}
                    tabIndex={0}
                    onClick={() => setSelectedId(associate.id)}
                    onKeyDown={(event) => event.key === 'Enter' && setSelectedId(associate.id)}
                    className="group border-surface-700/15 hover:bg-primary-50/70 focus-visible:bg-primary-50/70 cursor-pointer transition-colors duration-150 outline-none"
                  >
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <span
                          aria-hidden
                          className="bg-terciary-500 text-primary-100 typo-bold-text flex size-11 shrink-0 items-center justify-center rounded-full"
                        >
                          {getInitials(associate.name, associate.surnames)}
                        </span>
                        <span className="typo-bold-text text-carbon-500 group-hover:text-primary-700 transition-colors">
                          {associate.name} {associate.surnames}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="hidden px-5 py-4 md:table-cell">
                      {phones.length === 0 ? (
                        <span className="text-carbon-200">—</span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="bg-surface-600/60 text-carbon-500 rounded-full px-3 py-1 font-mono text-sm">
                            {phones[0]}
                          </span>
                          {phones.length > 1 && (
                            <span className="text-carbon-300 typo-sm-text font-medium">+{phones.length - 1}</span>
                          )}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="px-5 py-4 text-right">
                      <span
                        className={cn(
                          'typo-bold-text inline-flex min-w-14 items-center justify-center gap-1.5 rounded-full px-3 py-1 text-sm',
                          carCount > 0 ? 'bg-primary-100 text-primary-800' : 'bg-secondary-50 text-carbon-300',
                        )}
                      >
                        <CarFront className="size-4" aria-hidden />
                        <span className="font-numbers">{carCount}</span>
                      </span>
                    </TableCell>

                    <TableCell className="px-3 py-4">
                      <ChevronRight
                        className="text-carbon-200 group-hover:text-primary-700 size-5 transition-all group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AssociateSheet associateId={selectedId} onClose={() => setSelectedId(null)} />
      <CreateAssociateDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={() => router.refresh()} />
    </div>
  );
};

export default AssociatesView;
