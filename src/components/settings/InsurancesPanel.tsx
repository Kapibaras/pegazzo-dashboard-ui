'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CarFront, Pencil, Phone, PlusCircle, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CreateInsuranceDialog } from '@/components/vehicles/QuickCreateDialogs';
import VehicleStatCard from '@/components/vehicles/VehicleStatCard';
import { BUTTON_ICON_CLASS, primaryButton } from '@/lib/buttonStyles';
import { searchFieldClass } from '@/lib/formField';
import { Insurance } from '@/types/vehicle';
import DeleteInsuranceDialog from './DeleteInsuranceDialog';
import EditInsuranceDialog from './EditInsuranceDialog';

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const carsLabel = (count: number) => `${count} ${count === 1 ? 'coche' : 'coches'}`;

/**
 * Insurer management. Data comes from the server page; search runs locally, edit/delete go through server actions that
 * revalidate the route, and `router.refresh()` follows a create. The backend refuses to delete an insurer that still
 * has cars, so Eliminar is disabled up front using `carCount`.
 */
const InsurancesPanel = ({ insurances }: { insurances: Insurance[] }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [toEdit, setToEdit] = useState<Insurance | null>(null);
  const [toDelete, setToDelete] = useState<Insurance | null>(null);

  const filtered = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return insurances;
    return insurances.filter((item) => normalize(item.name).includes(term));
  }, [insurances, search]);

  const withPhone = insurances.filter((item) => (item.telephones?.length ?? 0) > 0).length;
  const insuredCars = insurances.reduce((sum, item) => sum + (item.carCount ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <VehicleStatCard
          icon={ShieldCheck}
          label="Aseguradoras"
          value={insurances.length}
          chipClassName="bg-primary-100 text-primary-800"
        />
        <VehicleStatCard
          icon={CarFront}
          label="Coches asegurados"
          value={insuredCars}
          chipClassName="bg-success-50 text-success-700"
        />
        <VehicleStatCard
          icon={Phone}
          label="Con teléfono de contacto"
          value={withPhone}
          hint={`de ${insurances.length}`}
          chipClassName="bg-warning-100 text-warning-700"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="text-carbon-200 absolute top-1/2 left-4 size-4 -translate-y-1/2" aria-hidden />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar aseguradora..."
            aria-label="Buscar aseguradora"
            className={searchFieldClass()}
          />
        </div>
        <Button onClick={() => setCreateOpen(true)} className={primaryButton()}>
          <PlusCircle className={BUTTON_ICON_CLASS} aria-hidden />
          Agregar aseguradora
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="bg-primary-50 flex size-14 items-center justify-center rounded-full">
              <ShieldCheck className="text-primary-700 size-7" aria-hidden />
            </div>
            <p className="typo-subtitle text-carbon-500">
              {insurances.length === 0 ? 'Aún no hay aseguradoras' : 'Sin resultados'}
            </p>
            <p className="typo-sm-text text-carbon-300">
              {insurances.length === 0 ? 'Agrega una para empezar.' : 'Prueba con otro nombre.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((item) => {
            const count = item.carCount ?? 0;
            const phones = item.telephones ?? [];
            return (
              <li
                key={item.id}
                className="border-surface-700/25 flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="bg-primary-100 text-primary-800 typo-bold-text flex size-10 shrink-0 items-center justify-center rounded-lg"
                  >
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="typo-bold-text text-carbon-500 truncate">{item.name}</h3>
                    <p className="typo-sm-text text-carbon-300">{carsLabel(count)}</p>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar ${item.name}`}
                      onClick={() => setToEdit(item)}
                      className="text-carbon-300 hover:bg-primary-50 hover:text-primary-700 size-9 cursor-pointer"
                    >
                      <Pencil className="size-[18px]" />
                    </Button>
                    <span
                      title={
                        count > 0 ? 'Tiene coches asignados: cambia su aseguradora para poder eliminarla' : undefined
                      }
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={count > 0}
                        aria-label={`Eliminar ${item.name}`}
                        onClick={() => setToDelete(item)}
                        className="text-carbon-300 hover:bg-error-50 hover:text-error-700 size-9 cursor-pointer"
                      >
                        <Trash2 className="size-[18px]" />
                      </Button>
                    </span>
                  </div>
                </div>

                {phones.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {phones.map((phone) => (
                      <li
                        key={phone}
                        className="typo-sm-text bg-surface-600/60 text-carbon-500 font-numbers flex items-center gap-1.5 rounded-full px-3 py-1"
                      >
                        <Phone className="text-carbon-300 size-3.5" aria-hidden />
                        {phone}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="typo-sm-text text-carbon-300">Sin teléfono de contacto</p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <CreateInsuranceDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={() => router.refresh()} />
      <EditInsuranceDialog insurance={toEdit} onClose={() => setToEdit(null)} />
      <DeleteInsuranceDialog target={toDelete} onClose={() => setToDelete(null)} />
    </div>
  );
};

export default InsurancesPanel;
