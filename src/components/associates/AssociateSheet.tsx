'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CarFront, ChevronRight, Info, Pencil, Phone, Trash2 } from 'lucide-react';
import { SingletonAPIClient } from '@/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { VehicleStatusBadge } from '@/components/vehicles';
import { VEHICLE_PLACEHOLDER_SRC } from '@/components/vehicles/VehicleCard';
import { normalizeApiError } from '@/helpers/apiError';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import { dangerOutlineButton, primaryButton } from '@/lib/buttonStyles';
import { cn } from '@/lib/utils';
import { getVehicleTitle } from '@/lib/vehicle';
import VehicleService from '@/services/vehicle';
import { AssociateDetail } from '@/types/vehicle';
import DeleteAssociateDialog from './DeleteAssociateDialog';
import EditAssociateDialog from './EditAssociateDialog';

type AssociateSheetProps = {
  associateId: number | null;
  onClose: () => void;
};

const getInitials = (name: string, surnames: string) =>
  `${name.trim().charAt(0)}${surnames.trim().charAt(0)}`.toUpperCase();

/** Same row anatomy as the transaction detail sheet: big muted icon, uppercase label, value underneath. */
const InfoRow = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-4 px-5 py-4">
    <Icon className="text-carbon-300 mt-0.5 h-7 w-7 shrink-0" strokeWidth={1.75} />
    <div className="min-w-0 flex-1">
      <p className="typo-overline text-carbon-300 mb-1">{label}</p>
      <div className="typo-text text-carbon-500 break-words">{children}</div>
    </div>
  </div>
);

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
  const hasCars = cars.length > 0;

  return (
    <>
      <Sheet open={associateId !== null} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="text-carbon-500 [&>button]:hover:text-terciary-500 [&>button]:text-carbon-500 fixed top-[4rem] flex h-[calc(100vh-4rem)] w-full flex-col gap-0 overflow-hidden md:max-w-sm [&>button>svg]:h-6 [&>button>svg]:w-6 [&>button>svg]:flex-shrink-0">
          <SheetHeader className="shrink-0">
            <SheetTitle className="typo-subtitle text-carbon-500 mb-4">Detalle de Socio</SheetTitle>
            <SheetDescription className="typo-text text-carbon-300">
              Datos de contacto y coches asociados.
            </SheetDescription>
          </SheetHeader>

          {isLoading || !associate ? (
            <div className="space-y-4 px-4">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : (
            <>
              <div className="flex flex-1 flex-col overflow-y-auto pb-4">
                {/* ── Hero: who the associate is and how many cars they have ───────── */}
                <div className="bg-primary-50 border-primary-100 mx-4 mb-4 rounded-xl border p-5">
                  <div className="flex items-center gap-4">
                    <div
                      aria-hidden
                      className="bg-terciary-500 text-primary-100 typo-subtitle flex size-14 shrink-0 items-center justify-center rounded-full"
                    >
                      {getInitials(associate.name, associate.surnames)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="typo-subtitle text-carbon-500 break-words">{fullName}</p>
                      <Badge
                        className={cn(
                          'typo-caption mt-1.5 rounded-md px-2.5 py-0.5 tracking-wide',
                          hasCars
                            ? 'bg-primary-100 text-primary-800 hover:bg-primary-100'
                            : 'bg-secondary-50 text-carbon-400 hover:bg-secondary-50',
                        )}
                      >
                        <CarFront className="size-3.5" aria-hidden />
                        {cars.length} {cars.length === 1 ? 'coche' : 'coches'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* ── Contact ───────────────────────────────────────────────────────── */}
                <div className="border-surface-700/20 bg-surface-400/40 mx-4 mb-4 overflow-hidden rounded-xl border">
                  <InfoRow icon={Phone} label="Teléfonos">
                    {phones.length === 0 ? (
                      <span className="text-carbon-300">Sin teléfonos registrados</span>
                    ) : (
                      <ul className="flex flex-col gap-1">
                        {phones.map((phone) => (
                          <li key={phone} className="typo-sm-text font-numbers">
                            {phone}
                          </li>
                        ))}
                      </ul>
                    )}
                  </InfoRow>
                </div>

                {/* ── Linked cars ───────────────────────────────────────────────────── */}
                <div className="mx-4">
                  <p className="typo-overline text-carbon-300 mb-2 px-1">Coches asociados ({cars.length})</p>
                  {hasCars ? (
                    <ul className="border-surface-700/20 divide-surface-700/15 divide-y overflow-hidden rounded-xl border bg-white">
                      {cars.map((car) => (
                        <li key={car.id}>
                          <Link
                            href={`/coches/${encodeURIComponent(car.id)}`}
                            className="group hover:bg-primary-50/70 flex items-center gap-3 px-3 py-3 transition-colors"
                          >
                            <div className="bg-surface-600/60 size-12 shrink-0 overflow-hidden rounded-md">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={car.agencyImage || VEHICLE_PLACEHOLDER_SRC}
                                alt=""
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="typo-bold-text text-carbon-500 group-hover:text-primary-700 truncate transition-colors">
                                {getVehicleTitle(car)}
                              </p>
                              <p className="typo-caption text-carbon-300 font-numbers break-all">{car.id}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <VehicleStatusBadge status={car.status} />
                                <span className="typo-caption text-carbon-300 font-numbers">{car.plate}</span>
                              </div>
                            </div>
                            <ChevronRight
                              className="text-carbon-200 group-hover:text-primary-700 size-5 shrink-0 transition-colors"
                              aria-hidden
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="border-surface-700/30 text-carbon-300 typo-sm-text rounded-xl border border-dashed px-4 py-6 text-center">
                      Este socio todavía no tiene coches asociados.
                    </div>
                  )}
                </div>
              </div>

              {/* ── Actions ───────────────────────────────────────────────────────── */}
              <div className="border-surface-700/20 shrink-0 border-t px-4 pt-4 pb-6">
                {hasCars && (
                  <p className="typo-sm-text text-carbon-300 mb-3 flex items-start gap-2">
                    <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                    Para eliminarlo, primero cambia el socio en sus coches.
                  </p>
                )}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    disabled={hasCars}
                    onClick={() => setDeleteOpen(true)}
                    className={dangerOutlineButton('flex-1 disabled:cursor-not-allowed')}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Eliminar
                  </Button>
                  <Button onClick={() => setEditOpen(true)} className={primaryButton('flex-1')}>
                    <Pencil className="size-4" aria-hidden />
                    Editar
                  </Button>
                </div>
              </div>
            </>
          )}
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
