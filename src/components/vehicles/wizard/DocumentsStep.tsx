'use client';

import { Eye, FileText, Info } from 'lucide-react';
import { getDocumentTypeLabel, requiredDocumentTypes } from '@/lib/vehicle';
import { VehicleDocument } from '@/types/vehicle';
import DocumentUpload, { StoredDocument } from '../DocumentUpload';
import ViewFileButton from '../ViewFileButton';
import { StepCard } from './fields';

type DocumentsStepProps = {
  carId: string;
  /** Decides which documents are required: a liquidated car has an invoice and no credit contract / amortization table. */
  isLiquidated: boolean;
  policyExpirationDate?: string;
  /** The current document of each type (kept by the wizard, so it survives navigating between steps). */
  storedDocuments: Record<string, StoredDocument>;
  onDocumentChange: (type: string, document: StoredDocument) => void;
  /** Documents the car already had, to list the ones that are not required in the current situation. */
  existingDocuments?: VehicleDocument[];
};

const DocumentsStep = ({
  carId,
  isLiquidated,
  policyExpirationDate,
  storedDocuments,
  onDocumentChange,
  existingDocuments = [],
}: DocumentsStepProps) => {
  const slots = requiredDocumentTypes(isLiquidated);
  const uploaded = slots.filter((type) => !!storedDocuments[type]).length;
  const missing = slots.length - uploaded;

  // e.g. an invoice already uploaded for a car that is now marked as not liquidated: shown, never lost.
  const others = existingDocuments.filter((doc) => !slots.includes(doc.type));

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-primary-50 text-primary-900 flex items-start gap-3 rounded-lg px-4 py-3 text-sm" role="note">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          {isLiquidated
            ? 'El coche está liquidado: se pide la factura de compra y no hace falta el contrato de crédito ni la tabla de amortización.'
            : 'El coche no está liquidado: se piden el contrato de crédito y la tabla de amortización.'}{' '}
          Todos los documentos de la lista son obligatorios y cada archivo se sube en cuanto lo seleccionas. Si subiste
          uno por error, usa <strong>Reemplazar</strong>.
        </p>
      </div>

      <StepCard
        title="Documentación"
        description="PDF, JPG, PNG o WEBP. Si es una foto, procura que el documento se vea completo y sin reflejos."
      >
        <p
          className={missing === 0 ? 'text-success-700 text-sm font-medium' : 'text-carbon-400 text-sm font-medium'}
          role="status"
          aria-live="polite"
        >
          {missing === 0
            ? `Documentación completa (${uploaded} de ${slots.length}).`
            : `${uploaded} de ${slots.length} documentos cargados · faltan ${missing}.`}
        </p>

        <div className="grid items-start gap-5 lg:grid-cols-2">
          {slots.map((type) => (
            <DocumentUpload
              key={type}
              entityType="car"
              entityId={carId}
              documentType={type}
              label={getDocumentTypeLabel(type)}
              required
              current={storedDocuments[type] ?? null}
              onChange={(document) => onDocumentChange(type, document)}
              expiryDate={
                type === 'insurance_policy' && policyExpirationDate ? `${policyExpirationDate}T00:00:00Z` : undefined
              }
            />
          ))}
        </div>
      </StepCard>

      {others.length > 0 && (
        <StepCard
          title="Otros documentos cargados"
          description="Ya estaban en el coche y no se piden en su situación actual."
        >
          <ul className="divide-surface-600/60 divide-y">
            {others.map((doc) => (
              <li key={doc.id} className="flex items-center gap-3 py-2">
                <FileText className="text-carbon-300 size-4" aria-hidden />
                <span className="text-carbon-500 flex-1 text-sm">{getDocumentTypeLabel(doc.type)}</span>
                <ViewFileButton
                  items={[{ url: doc.url, title: getDocumentTypeLabel(doc.type) }]}
                  aria-label={`Ver ${getDocumentTypeLabel(doc.type)}`}
                  className="text-primary-800 flex cursor-pointer items-center gap-1 text-sm font-medium hover:underline"
                >
                  Ver <Eye className="size-3.5" aria-hidden />
                </ViewFileButton>
              </li>
            ))}
          </ul>
        </StepCard>
      )}
    </div>
  );
};

export default DocumentsStep;
