import { cn } from '@/lib/utils';

const FOLIO_PATTERN = /^([A-Z]+)-([A-Z]+)-(.+?)\(([^)]+)\)-(\d+)$/;

const SEGMENTS = [
  { key: 'owner', label: 'Propietario', hint: 'S socio · US nosotros (Pedro/Gaby) · PG Pegazzo', className: 'bg-primary-100 text-primary-900' },
  { key: 'associate', label: 'Socio', hint: 'Iniciales del socio', className: 'bg-success-50 text-success-700' },
  { key: 'car', label: 'Coche', hint: 'Abreviatura del modelo', className: 'bg-warning-100 text-warning-700' },
  { key: 'transmission', label: 'Transmisión', hint: 'TM manual · TA automática', className: 'bg-secondary-50 text-carbon-400' },
  { key: 'consecutive', label: 'Consecutivo', hint: 'Coches de ese socio', className: 'bg-error-50 text-error-700' },
] as const;

/** The computed folio split into its colour-coded parts (read-only; it is never typed by the user). */
const FolioDisplay = ({ folio, className }: { folio: string; className?: string }) => {
  const match = FOLIO_PATTERN.exec(folio);

  if (!match) {
    return <p className={cn('font-numbers text-carbon-500 text-2xl font-semibold', className)}>{folio}</p>;
  }

  const [, owner, associate, car, transmission, consecutive] = match;
  const parts = [owner, associate, car, transmission, consecutive];

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <p className="font-numbers flex flex-wrap items-center gap-1 text-2xl font-semibold" aria-label={`Folio ${folio}`}>
        {parts.map((part, index) => (
          <span key={SEGMENTS[index].key} className="flex items-center gap-1">
            {index > 0 && <span className="text-carbon-200">{index === 4 ? '-' : index === 3 ? '' : '-'}</span>}
            <span className={cn('rounded-md px-2 py-0.5', SEGMENTS[index].className)}>
              {index === 3 ? `(${part})` : part}
            </span>
          </span>
        ))}
      </p>
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-5">
        {SEGMENTS.map((segment, index) => (
          <div key={segment.key} className="flex flex-col gap-0.5">
            <dt className="flex items-center gap-1.5 text-xs font-medium">
              <span aria-hidden className={cn('size-2.5 rounded-sm', segment.className)} />
              {segment.label}
            </dt>
            <dd className="font-numbers text-carbon-500 text-sm">{parts[index]}</dd>
            <dd className="text-carbon-200 text-xs">{segment.hint}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default FolioDisplay;
