import Link from 'next/link';
import {
  BatteryCharging,
  CalendarClock,
  Camera,
  Car,
  ChevronRight,
  CircleDollarSign,
  ExternalLink,
  FileText,
  Fingerprint,
  Gauge,
  Landmark,
  Plus,
  Receipt,
  Scale,
  ShieldCheck,
  UserRound,
  Wrench,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  formatCurrency,
  formatDate,
  formatOdometer,
  getDocumentTypeLabel,
  getTransmissionLabel,
  getVehicleTitle,
  isPegazzoOwner,
} from '@/lib/vehicle';
import { VehicleDetail as VehicleDetailData } from '@/types/vehicle';
import CanManage from './CanManage';
import ExpiryBadge from './ExpiryBadge';
import VehicleDetailActions from './VehicleDetailActions';
import VehicleGallery from './VehicleGallery';
import VehicleInfoCard from './VehicleInfoCard';
import VehicleStatCard from './VehicleStatCard';
import VehicleStatusBadge from './VehicleStatusBadge';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-carbon-500 text-lg font-bold">{children}</h2>
);

const VehicleDetail = ({ vehicle }: { vehicle: VehicleDetailData }) => {
  const title = getVehicleTitle(vehicle);
  const archived = !!vehicle.archivedAt;
  const photos = vehicle.photos ?? [];
  const documents = vehicle.documents ?? [];
  const pegazzoOwned = isPegazzoOwner(vehicle.legalOwnerName);
  const associate = vehicle.associate;
  const driver = vehicle.assignedDriver;

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <nav aria-label="Ruta de navegación" className="text-carbon-300 flex items-center gap-1.5 text-sm">
          <Link href="/coches" className="hover:text-primary-800 hover:underline">
            Coches
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-carbon-500 font-medium" aria-current="page">
            {title}
          </span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="typo-title text-carbon-500">{title}</h1>
              <VehicleStatusBadge status={vehicle.status} size="lg" />
              {archived && <Badge className="bg-secondary-50 text-carbon-400 hover:bg-secondary-50 px-3 py-1 text-sm">Archivado</Badge>}
            </div>
            <p className="font-numbers text-carbon-300 text-sm">
              <span className="sr-only">Folio interno: </span>
              {vehicle.id}
            </p>
          </div>
          <VehicleDetailActions vehicleId={vehicle.id} vehicleName={title} status={vehicle.status} archived={archived} />
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[400px_1fr]">
        <VehicleGallery agencyImage={vehicle.agencyImage} photos={vehicle.photos} title={title} />

        <div className="grid grid-cols-2 gap-4">
          <VehicleStatCard
            icon={Gauge}
            label="Odómetro"
            value={formatOdometer(vehicle.odometer)}
            chipClassName="bg-primary-50 text-primary-800"
          />
          <VehicleStatCard
            icon={CircleDollarSign}
            label="Valor de unidad"
            value={formatCurrency(vehicle.unitValue)}
            chipClassName="bg-success-50 text-success-700"
          />
          <VehicleStatCard
            icon={CalendarClock}
            label="Vencimiento de póliza"
            value={formatDate(vehicle.insurance?.policyExpirationDate)}
            hint={vehicle.insurance?.name}
            chipClassName="bg-warning-100 text-warning-700"
          />
          <VehicleStatCard
            icon={UserRound}
            label="Socio"
            value={associate ? `${associate.name} ${associate.surnames}` : 'Sin socio'}
            hint={associate?.telephones?.[0]}
            chipClassName="bg-terciary-50 text-terciary-500"
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <VehicleInfoCard
          icon={Car}
          title="Identidad"
          rows={[
            { label: 'Marca', value: vehicle.make },
            { label: 'Modelo', value: vehicle.model },
            { label: 'Año', value: vehicle.year, mono: true },
            { label: 'Color', value: vehicle.color },
            { label: 'Carrocería', value: vehicle.bodyType },
          ]}
        />
        <VehicleInfoCard
          icon={Wrench}
          title="Datos técnicos"
          rows={[
            { label: 'VIN', value: vehicle.vin, mono: true },
            { label: 'Placa', value: vehicle.plate, mono: true },
            { label: 'Serie de motor', value: vehicle.engineSerialNumber, mono: true },
            { label: 'Motor', value: vehicle.engineType },
            { label: 'Transmisión', value: getTransmissionLabel(vehicle.transmission) },
            { label: 'Puertas', value: vehicle.doorsNumber, mono: true },
            { label: 'Pasajeros', value: vehicle.passengersNumber, mono: true },
            { label: 'Llantas', value: vehicle.tireSpecification, mono: true },
          ]}
        />
        <VehicleInfoCard
          icon={BatteryCharging}
          title="Batería"
          rows={[
            { label: 'Modelo', value: vehicle.batteryModel },
            { label: 'Número de serie', value: vehicle.batterySerialNumber, mono: true },
            { label: 'Fecha', value: formatDate(vehicle.batteryDate), mono: true },
          ]}
        />
        <VehicleInfoCard
          icon={ShieldCheck}
          title="Seguro"
          rows={[
            { label: 'Aseguradora', value: vehicle.insurance?.name },
            { label: 'Número de póliza', value: vehicle.insurance?.policyNumber, mono: true },
            { label: 'Tipo de póliza', value: vehicle.insurance?.policyType },
            { label: 'Vigencia', value: formatDate(vehicle.insurance?.policyExpirationDate), mono: true },
          ]}
        />
        <VehicleInfoCard
          icon={Receipt}
          title="Registro y facturación"
          rows={[
            { label: 'Valor de unidad', value: formatCurrency(vehicle.unitValue), mono: true },
            { label: 'Valor de facturación', value: formatCurrency(vehicle.unitBillingValue), mono: true },
            { label: 'Número de factura', value: vehicle.billNumber, mono: true },
            { label: 'RPV', value: vehicle.publicVehicleRegistry, mono: true },
            { label: 'Fecha de alta RPV', value: formatDate(vehicle.altaPublicVehicleRegistry), mono: true },
          ]}
        />
        <VehicleInfoCard
          icon={Landmark}
          title="Financiamiento"
          badge={
            vehicle.isFinancedLiquidated ? (
              <Badge className="bg-success-50 text-success-700 hover:bg-success-50 text-xs">Liquidado</Badge>
            ) : (
              <Badge className="bg-warning-100 text-warning-700 hover:bg-warning-100 text-xs">No liquidado</Badge>
            )
          }
          rows={
            vehicle.isFinancedLiquidated
              ? [{ label: 'Situación', value: 'El coche está liquidado.' }]
              : [
                  { label: 'Agencia', value: vehicle.financingAgency },
                  { label: 'Fecha de compra', value: formatDate(vehicle.financingPurchaseDate), mono: true },
                  {
                    label: 'Plazo',
                    value: vehicle.financingTermMonths ? `${vehicle.financingTermMonths} meses` : null,
                    mono: true,
                  },
                  { label: 'Restante', value: formatCurrency(vehicle.financingRemainingAmount), mono: true },
                ]
          }
        />
        <VehicleInfoCard
          icon={Scale}
          title="Propietario legal"
          badge={
            <Badge
              className={
                pegazzoOwned
                  ? 'bg-primary-50 text-primary-800 hover:bg-primary-50 text-xs'
                  : 'bg-secondary-50 text-carbon-400 hover:bg-secondary-50 text-xs'
              }
            >
              {pegazzoOwned ? 'Pegazzo' : 'Propietario particular'}
            </Badge>
          }
          rows={[
            { label: 'Nombre', value: vehicle.legalOwnerName },
            { label: 'Apellidos', value: vehicle.legalOwnerSurnames },
          ]}
        />
        <VehicleInfoCard
          icon={Fingerprint}
          title="Conductor asignado"
          rows={[
            {
              label: 'Conductor',
              value: driver ? `${driver.name} ${driver.surnames}` : 'Sin asignar',
            },
          ]}
        />
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="photos-title">
        <div className="flex items-center gap-3">
          <SectionTitle>
            <span id="photos-title">Fotos del vehículo</span>
          </SectionTitle>
          <span className="text-carbon-300 text-sm">
            {photos.length === 0 ? 'Aún no hay fotos' : `${photos.length} ${photos.length === 1 ? 'foto subida' : 'fotos subidas'}`}
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {photos.map((src, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={`Foto ${index + 1} de ${title}`}
              className="border-surface-600/70 h-[100px] w-[140px] rounded-lg border object-cover"
              loading="lazy"
            />
          ))}
          <CanManage>
            <Link
              href={`/coches/${encodeURIComponent(vehicle.id)}/editar`}
              className="border-surface-700/60 text-carbon-300 hover:border-primary-700 hover:text-primary-800 flex h-[100px] w-[140px] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-sm transition-colors"
            >
              {photos.length === 0 ? <Camera className="size-5" aria-hidden /> : <Plus className="size-5" aria-hidden />}
              Agregar
            </Link>
          </CanManage>
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="documents-title">
        <SectionTitle>
          <span id="documents-title">Documentos</span>
        </SectionTitle>
        {documents.length === 0 ? (
          <p className="text-carbon-300 border-surface-700/60 rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm">
            Aún no hay documentos cargados.
          </p>
        ) : (
          <ul className="border-surface-600/70 divide-surface-600/60 divide-y rounded-xl border bg-white">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center gap-4 px-4 py-3">
                <span className="bg-primary-50 text-primary-800 flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <FileText className="size-[18px]" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-carbon-500 truncate text-sm font-semibold">{getDocumentTypeLabel(doc.type)}</p>
                  <p className="text-carbon-200 text-xs">
                    {doc.expiryDate ? `Vence el ${formatDate(doc.expiryDate)}` : 'Sin fecha de vencimiento'}
                  </p>
                </div>
                <ExpiryBadge status={doc.expiryStatus} />
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-800 hover:text-primary-900 flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  Ver <ExternalLink className="size-3.5" aria-hidden />
                  <span className="sr-only">{getDocumentTypeLabel(doc.type)} (abre en una pestaña nueva)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
};

export default VehicleDetail;
