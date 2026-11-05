import { Eye, FileText, FileX } from 'lucide-react';
import ExpiryBadge from '@/components/common/files/ExpiryBadge';
import ViewFileTile from '@/components/common/files/ViewFileTile';
import { Badge } from '@/components/ui/badge';
import { currentDocumentsByType, getDriverDocumentLabel } from '@/lib/driver';
import { formatDate } from '@/lib/format';
import { ApiDocument } from '@/types/document';

type DriverDocumentListProps = {
  /** Document types to list, in order (the taxonomy of the owner: driver or guarantor). */
  types: readonly string[];
  documents: ApiDocument[];
  /** Types that must be uploaded; a missing one shows "Faltante" instead of "No cargado". */
  required: readonly string[];
  /** Added to the viewer title, e.g. the guarantor's name. */
  viewerTitleSuffix?: string;
};

/**
 * The documents of a driver or a guarantor, one row per type of the taxonomy: the current document opens the in-app
 * viewer (←/→ pages through all of them); a type without document is shown as missing.
 */
const DriverDocumentList = ({ types, documents, required, viewerTitleSuffix }: DriverDocumentListProps) => {
  const current = currentDocumentsByType(documents);
  const present = types.filter((type) => current[type]);
  const viewerItems = present.map((type) => ({
    url: current[type].url,
    title: viewerTitleSuffix
      ? `${getDriverDocumentLabel(type)} · ${viewerTitleSuffix}`
      : getDriverDocumentLabel(type),
  }));

  return (
    <ul className="border-surface-600/70 divide-surface-600/60 divide-y overflow-hidden rounded-xl border bg-white">
      {types.map((type) => {
        const doc = current[type];
        const label = getDriverDocumentLabel(type);

        if (!doc) {
          const isRequired = required.includes(type);
          return (
            <li key={type} className="flex items-center gap-4 px-4 py-3">
              <span className="bg-secondary-50 text-carbon-300 flex size-9 shrink-0 items-center justify-center rounded-lg">
                <FileX className="size-[18px]" aria-hidden />
              </span>
              <p className="typo-label text-carbon-500 min-w-0 flex-1 truncate">{label}</p>
              {isRequired ? (
                <Badge className="typo-caption bg-error-50 text-error-700 hover:bg-error-50">Faltante</Badge>
              ) : (
                <span className="typo-caption text-carbon-300">No cargado</span>
              )}
            </li>
          );
        }

        return (
          <li key={type}>
            <ViewFileTile
              items={viewerItems}
              startIndex={present.indexOf(type)}
              aria-label={`Ver ${label}`}
              className="hover:bg-surface-400/60 group/doc flex items-center gap-4 px-4 py-3 transition-colors"
            >
              <span className="bg-primary-50 text-primary-800 flex size-9 shrink-0 items-center justify-center rounded-lg">
                <FileText className="size-[18px]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="typo-label text-carbon-500 truncate">{label}</p>
                {doc.expiryDate && <p className="typo-caption text-carbon-300">Vence el {formatDate(doc.expiryDate)}</p>}
              </div>
              <ExpiryBadge status={doc.expiryStatus} />
              <span className="typo-label text-primary-800 group-hover/doc:text-primary-900 flex items-center gap-1 group-hover/doc:underline">
                Ver <Eye className="size-3.5" aria-hidden />
              </span>
            </ViewFileTile>
          </li>
        );
      })}
    </ul>
  );
};

export default DriverDocumentList;
