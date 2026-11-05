import Link from 'next/link';
import {
  CalendarClock,
  CalendarPlus,
  Car,
  ChevronRight,
  FileWarning,
  Home,
  IdCard,
  Phone,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react';
import CanManage from '@/components/common/CanManage';
import ViewFileButton from '@/components/common/files/ViewFileButton';
import InfoCard from '@/components/common/InfoCard';
import StatCard from '@/components/common/StatCard';
import { Badge } from '@/components/ui/badge';
import { VEHICLE_PLACEHOLDER_SRC } from '@/components/vehicles/VehicleCard';
import { EXPIRY_STATUS_LABELS, getExpiryStatus } from '@/lib/documents';
import {
  DRIVER_DOCUMENT_TYPES,
  GUARANTOR_DOCUMENT_TYPES,
  MAX_GUARANTORS,
  REQUIRED_DRIVER_DOCUMENT_TYPES,
  REQUIRED_GUARANTOR_DOCUMENT_TYPES,
  getActivationBlocker,
  getDriverDocumentLabel,
  getDriverFullName,
  getMissingDriverDocuments,
} from '@/lib/driver';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { DocumentExpiryStatus } from '@/types/document';
import { DriverDetail as DriverDetailData } from '@/types/driver';
import { DRIVER_PLACEHOLDER_SRC } from './DriverCard';
import DriverDetailActions from './DriverDetailActions';
import DriverDocumentList from './DriverDocumentList';
import DriverStatusSelector from './DriverStatusSelector';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="typo-subtitle text-carbon-500">{children}</h2>
);

const LICENSE_CHIP: Record<DocumentExpiryStatus, string> = {
  valid: 'bg-success-50 text-success-700',
  expiring_soon: 'bg-warning-100 text-warning-700',
  expired: 'bg-error-50 text-error-700',
};

const DriverDetail = ({ driver }: { driver: DriverDetailData }) => {
  const fullName = getDriverFullName(driver);
  const archived = !!driver.archivedAt;
  const guarantors = driver.guarantors ?? [];
  const car = driver.assignedCar;
  const missing = getMissingDriverDocuments(driver);
  const activationBlocker = getActivationBlocker(driver);
  const licenseStatus = getExpiryStatus(driver.licenseValidity);

  // Everything that is still missing, in words, for the banner.
  const missingLabels = [
    ...missing.driver.map(getDriverDocumentLabel),
    ...missing.guarantors.flatMap(({ guarantor, missing: types }) =>
      types.map((type) => `${getDriverDocumentLabel(type)} de ${guarantor.name} ${guarantor.surnames}`.trim()),
    ),
  ];
  const showBanner = missingLabels.length > 0 || guarantors.length === 0;

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <nav aria-label="Ruta de navegación" className="typo-sm-text text-carbon-300 flex items-center gap-1.5">
          <Link href="/conductores" className="hover:text-primary-800 hover:underline">
            Conductores
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-carbon-500 font-medium" aria-current="page">
            {fullName}
          </span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="typo-title text-carbon-500">{fullName}</h1>
              <DriverStatusSelector
                driverId={driver.id}
                driverName={fullName}
                status={driver.status}
                archived={archived}
                activationBlocker={activationBlocker}
              />
              {archived && (
                <Badge className="typo-sm-text bg-secondary-50 text-carbon-400 hover:bg-secondary-50 px-3 py-1">
                  Archivado
                </Badge>
              )}
            </div>
            <p className="typo-sm-text font-numbers text-carbon-300">
              <span className="sr-only">Folio interno: </span>
              {driver.id}
            </p>
          </div>
          <DriverDetailActions
            driverId={driver.id}
            driverName={fullName}
            archived={archived}
            status={driver.status}
            missingDocumentsCount={missing.total}
          />
        </div>

        {showBanner && (
          <div
            role="status"
            className="typo-sm-text border-warning-600/30 bg-warning-100/60 text-warning-800 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border px-4 py-3"
          >
            <FileWarning className="text-warning-700 size-5 shrink-0" aria-hidden />
            <p className="min-w-0 flex-1">
              <strong>Información incompleta.</strong>{' '}
              {guarantors.length === 0 && 'Falta registrar al menos un aval. '}
              {missingLabels.length > 0 && `Faltan: ${missingLabels.join(', ')}. `}
              Mientras tanto no se puede activar al conductor.
            </p>
            <CanManage>
              <Link
                href={`/conductores/${encodeURIComponent(driver.id)}/editar${missingLabels.length > 0 ? '?paso=documentos' : ''}`}
                className="text-warning-800 font-semibold underline underline-offset-2 hover:no-underline"
              >
                {missingLabels.length > 0 ? 'Completar documentos' : 'Registrar aval'}
              </Link>
            </CanManage>
          </div>
        )}
      </header>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <div className="from-terciary-500 to-secondary-500 relative aspect-[4/3] w-full max-w-[280px] overflow-hidden rounded-xl bg-gradient-to-br">
          {driver.photo ? (
            <ViewFileButton
              items={[{ url: driver.photo, title: `Foto de ${fullName}` }]}
              aria-label={`Ampliar la foto de ${fullName}`}
              className="focus-visible:ring-primary-700 size-full cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-inset"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={driver.photo} alt={`Foto de ${fullName}`} className="size-full object-cover" />
            </ViewFileButton>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={DRIVER_PLACEHOLDER_SRC} alt="Sin foto" className="size-full object-cover" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={CalendarClock}
            label="Vigencia de licencia"
            value={formatDate(driver.licenseValidity)}
            hint={licenseStatus ? EXPIRY_STATUS_LABELS[licenseStatus] : undefined}
            chipClassName={licenseStatus ? LICENSE_CHIP[licenseStatus] : 'bg-primary-50 text-primary-800'}
          />
          <StatCard
            icon={UsersRound}
            label="Avales"
            value={guarantors.length}
            hint={`Máximo ${MAX_GUARANTORS}`}
            chipClassName="bg-primary-50 text-primary-800"
          />
          <StatCard
            icon={Car}
            label="Coche asignado"
            value={car ? `${car.make} ${car.model}` : 'Sin asignar'}
            hint={car?.plate}
            chipClassName="bg-terciary-50 text-terciary-500"
          />
          <StatCard
            icon={CalendarPlus}
            label="Fecha de alta"
            value={formatDate(driver.createdAt)}
            chipClassName="bg-success-50 text-success-700"
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <InfoCard
          icon={UserRound}
          title="Datos personales"
          rows={[
            { label: 'Nombre', value: driver.name },
            { label: 'Apellidos', value: driver.surnames },
            { label: 'Identificación', value: driver.identificationNumber, mono: true },
          ]}
        />
        <InfoCard
          icon={IdCard}
          title="Licencia de conducir"
          badge={
            licenseStatus && (
              <Badge className={cn('typo-caption hover:bg-transparent', LICENSE_CHIP[licenseStatus])}>
                {EXPIRY_STATUS_LABELS[licenseStatus]}
              </Badge>
            )
          }
          rows={[
            { label: 'Número', value: driver.licenseNumber, mono: true },
            { label: 'Vigencia', value: formatDate(driver.licenseValidity), mono: true },
          ]}
        />
        <InfoCard
          icon={Phone}
          title="Contacto"
          rows={[{ label: 'Teléfonos', value: driver.telephones?.join(' · '), mono: true }]}
        />
        <InfoCard
          icon={Home}
          title="Domicilio"
          rows={[
            { label: 'Domicilio', value: driver.address },
            { label: 'Cocheras', value: driver.garageAddress?.join(' · ') },
          ]}
        />
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="documents-title">
        <SectionTitle>
          <span id="documents-title">Documentos</span>
        </SectionTitle>
        <DriverDocumentList
          types={DRIVER_DOCUMENT_TYPES}
          documents={driver.documents ?? []}
          required={REQUIRED_DRIVER_DOCUMENT_TYPES}
        />
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="guarantors-title">
        <div className="flex items-center gap-3">
          <SectionTitle>
            <span id="guarantors-title">Avales</span>
          </SectionTitle>
          <span className="typo-sm-text text-carbon-300">
            {guarantors.length === 0
              ? 'Sin avales registrados'
              : `${guarantors.length} ${guarantors.length === 1 ? 'aval' : 'avales'}`}
          </span>
        </div>

        {guarantors.length === 0 ? (
          <p className="typo-sm-text text-carbon-300 border-surface-700/60 rounded-lg border-2 border-dashed px-4 py-6 text-center">
            Este conductor aún no tiene avales.
          </p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {guarantors.map((guarantor) => {
              const name = `${guarantor.name} ${guarantor.surnames}`.trim();
              return (
                <div
                  key={guarantor.id}
                  className="border-surface-600/70 flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                >
                  <header className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="bg-primary-50 text-primary-800 flex size-9 shrink-0 items-center justify-center rounded-lg">
                        <ShieldCheck className="size-[18px]" aria-hidden />
                      </span>
                      <h3 className="typo-bold-text text-carbon-500 truncate">{name}</h3>
                    </div>
                    <Badge className="typo-caption bg-secondary-50 text-carbon-400 hover:bg-secondary-50 shrink-0">
                      {guarantor.relation}
                    </Badge>
                  </header>

                  <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <dt className="typo-caption text-carbon-300">Teléfonos</dt>
                      <dd className="typo-sm-text font-numbers text-carbon-500 truncate">
                        {guarantor.telephones?.join(' · ') || '—'}
                      </dd>
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <dt className="typo-caption text-carbon-300">Domicilio</dt>
                      <dd className="typo-sm-text text-carbon-500 truncate">{guarantor.address || '—'}</dd>
                    </div>
                  </dl>

                  <DriverDocumentList
                    types={GUARANTOR_DOCUMENT_TYPES}
                    documents={guarantor.documents ?? []}
                    required={REQUIRED_GUARANTOR_DOCUMENT_TYPES}
                    viewerTitleSuffix={name}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="car-title">
        <SectionTitle>
          <span id="car-title">Coche asignado</span>
        </SectionTitle>
        {car ? (
          <Link
            href={`/coches/${encodeURIComponent(car.id)}`}
            aria-label={`Ver el coche ${car.make} ${car.model}`}
            className="border-surface-600/70 hover:bg-surface-400/60 focus-visible:ring-primary-700 group flex items-center gap-4 rounded-xl border bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors outline-none focus-visible:ring-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={car.agencyImage || VEHICLE_PLACEHOLDER_SRC}
              alt=""
              className="h-14 w-[88px] shrink-0 rounded-md object-cover"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <p className="typo-bold-text text-carbon-500 truncate">
                {car.make} {car.model}
              </p>
              <p className="typo-sm-text font-numbers text-carbon-300">{car.plate}</p>
            </div>
            <span className="typo-label text-primary-800 flex items-center gap-1 group-hover:underline">
              Ver coche <ChevronRight className="size-3.5" aria-hidden />
            </span>
          </Link>
        ) : (
          <p className="typo-sm-text text-carbon-300 border-surface-700/60 rounded-lg border-2 border-dashed px-4 py-6 text-center">
            Sin coche asignado.
          </p>
        )}
      </section>
    </article>
  );
};

export default DriverDetail;
