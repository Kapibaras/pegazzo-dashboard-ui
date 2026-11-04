'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CarFront, Pencil, Phone, Trash2 } from 'lucide-react';
import { SingletonAPIClient } from '@/api';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { VehicleStatusBadge } from '@/components/vehicles';
import { normalizeApiError } from '@/helpers/apiError';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import { getVehicleTitle } from '@/lib/vehicle';
import VehicleService from '@/services/vehicle';
import { AssociateDetail } from '@/types/vehicle';
import DeleteAssociateDialog from './DeleteAssociateDialog';
import EditAssociateDialog from './EditAssociateDialog';

type AssociateSheetProps = {
  associateId: number | null;
  onClose: () => void;
};

/** Detail of one associate: contact data, the cars linked to it (links) and the edit / delete actions. */
const AssociateSheet = ({ associateId, onClose }: AssociateSheetProps) => {
  const router = useRouter();
  const { handleApiError } = useApiErrorHandler();
  const service = useMemo(() => new VehicleService(SingletonAPIClient.getInstance()), []);

  const [associate, setAssociate] = useState<AssociateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (associateId === null) return;
    let cancelled = false;
    setAssociate(null);
    setIsLoading(true);

    service
      .getAssociate(associateId)
      .then((detail) => !cancelled && setAssociate(detail))
      .catch(async (error) => {
        if (cancelled) return;
        await handleApiError(normalizeApiError(error), ['common', 'vehicles']);
        onClose();
      })
      .finally(() => !cancelled && setIsLoading(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [associateId, service]);

  const fullName = associate ? `${associate.name} ${associate.surnames}` : '';
  const cars = associate?.cars ?? [];
  const phones = associate?.telephones ?? [];

  return (
    <>
      <Sheet open={associateId !== null} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="bg-surface-500 text-carbon-500 w-full gap-0 overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="typo-subtitle text-carbon-500">{fullName || 'Socio'}</SheetTitle>
            <SheetDescription className="typo-text text-carbon-300">
              Datos de contacto y coches asociados.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6 px-4 pb-6">
            {isLoading || !associate ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <>
                <section className="space-y-2">
                  <h3 className="typo-bold-text text-carbon-400 flex items-center gap-2">
                    <Phone className="size-4" aria-hidden /> Teléfonos
                  </h3>
                  {phones.length === 0 ? (
                    <p className="typo-sm-text text-carbon-200">Sin teléfonos registrados.</p>
                  ) : (
                    <ul className="flex flex-wrap gap-2">
                      {phones.map((phone) => (
                        <li key={phone} className="bg-surface-600/60 typo-numbers rounded-full px-3 py-1 text-sm">
                          {phone}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="space-y-2">
                  <h3 className="typo-bold-text text-carbon-400 flex items-center gap-2">
                    <CarFront className="size-4" aria-hidden /> Coches ({cars.length})
                  </h3>
                  {cars.length === 0 ? (
                    <p className="typo-sm-text text-carbon-200">Este socio todavía no tiene coches asociados.</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {cars.map((car) => (
                        <li key={car.id}>
                          <Link
                            href={`/coches/${encodeURIComponent(car.id)}`}
                            className="border-secondary-100 hover:bg-primary-50/80 flex items-center justify-between gap-3 rounded-md border bg-white px-3 py-2.5 transition-colors"
                          >
                            <span className="min-w-0">
                              <span className="typo-bold-text text-primary-700 block truncate">
                                {getVehicleTitle(car)}
                              </span>
                              <span className="typo-sm-text text-carbon-300 typo-numbers block break-all">
                                {car.id} · {car.plate}
                              </span>
                            </span>
                            <VehicleStatusBadge status={car.status} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <div className="mt-2 flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditOpen(true)}
                    className="cursor-pointer gap-2"
                  >
                    <Pencil className="size-4" /> Editar datos
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={cars.length > 0}
                    onClick={() => setDeleteOpen(true)}
                    className="text-error-700 hover:text-error-700 cursor-pointer gap-2 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="size-4" /> Eliminar socio
                  </Button>
                  {cars.length > 0 && (
                    <p className="typo-sm-text text-carbon-300">
                      No se puede eliminar mientras tenga coches. Cambia el socio en esos coches primero.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {associate && (
        <>
          <EditAssociateDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            associate={associate}
            onSaved={(updated) => {
              setAssociate((prev) => (prev ? { ...prev, ...updated, car_count: prev.car_count } : prev));
              router.refresh();
            }}
          />
          <DeleteAssociateDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            associateId={associate.id}
            associateName={fullName}
            onDeleted={() => {
              onClose();
              router.refresh();
            }}
          />
        </>
      )}
    </>
  );
};

export default AssociateSheet;
