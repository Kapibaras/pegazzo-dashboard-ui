'use client';

import { Info, UserRound } from 'lucide-react';
import DocumentUpload, { StoredDocument } from '@/components/common/files/DocumentUpload';
import { StepCard } from '@/components/common/wizard/fields';
import {
  DRIVER_DOCUMENT_TYPES,
  GUARANTOR_DOCUMENT_TYPES,
  REQUIRED_DRIVER_DOCUMENT_TYPES,
  REQUIRED_GUARANTOR_DOCUMENT_TYPES,
  getDriverDocumentLabel,
} from '@/lib/driver';

export type DocumentsStepGuarantor = {
  /** Backend id. Missing for a guarantor added in the edit form that has not been saved yet. */
  guarantorId?: number;
  label: string;
};

type DocumentsStepProps = {
  driverId: string;
  /** `YYYY-MM-DD`; it is the expiry date of the driver's license document. */
  licenseValidity?: string;
  /** Current document of each type of the driver (kept by the wizard so it survives navigating between steps). */
  storedDocuments: Record<string, StoredDocument>;
  onDocumentChange: (type: string, document: StoredDocument) => void;
  guarantors: DocumentsStepGuarantor[];
  /** Current documents of each guarantor, by guarantor id. */
  guarantorDocuments: Record<number, Record<string, StoredDocument>>;
  onGuarantorDocumentChange: (guarantorId: number, type: string, document: StoredDocument) => void;
  /** Number of required documents still missing (driver + guarantors). */
  missingCount: number;
  requiredCount: number;
};

const ERROR_MODULES = ['common', 'drivers'] as const;

const DocumentsStep = ({
  driverId,
  licenseValidity,
  storedDocuments,
  onDocumentChange,
  guarantors,
  guarantorDocuments,
  onGuarantorDocumentChange,
  missingCount,
  requiredCount,
}: DocumentsStepProps) => {
  const uploaded = requiredCount - missingCount;

  return (
    <div className="flex flex-col gap-5">
      <div
        className="typo-sm-text bg-primary-50 text-primary-900 flex items-start gap-3 rounded-lg px-4 py-3"
        role="note"
      >
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          Cada archivo se sube en cuanto lo seleccionas. Son obligatorios la INE, la licencia y el comprobante de
          domicilio del conductor, y la INE y el comprobante de cada aval; el contrato y el pagaré son opcionales. Si
          subiste uno por error, usa <strong>Reemplazar</strong>.
        </p>
      </div>

      <StepCard
        title="Documentación del conductor"
        description="PDF, JPG, PNG o WEBP. Si es una foto, procura que el documento se vea completo y sin reflejos."
      >
        <p
          className={missingCount === 0 ? 'typo-label text-success-700' : 'typo-label text-carbon-400'}
          role="status"
          aria-live="polite"
        >
          {missingCount === 0
            ? `Documentación obligatoria completa (${uploaded} de ${requiredCount}).`
            : `${uploaded} de ${requiredCount} documentos obligatorios cargados · faltan ${missingCount}.`}
        </p>

        <div className="grid items-start gap-5 lg:grid-cols-2">
          {DRIVER_DOCUMENT_TYPES.map((type) => (
            <DocumentUpload
              key={type}
              entityType="driver"
              entityId={driverId}
              documentType={type}
              label={getDriverDocumentLabel(type)}
              required={REQUIRED_DRIVER_DOCUMENT_TYPES.includes(type)}
              errorModules={[...ERROR_MODULES]}
              current={storedDocuments[type] ?? null}
              onChange={(document) => onDocumentChange(type, document)}
              expiryDate={type === 'driver_license' && licenseValidity ? `${licenseValidity}T00:00:00Z` : undefined}
            />
          ))}
        </div>
      </StepCard>

      {guarantors.map((guarantor, index) => (
        <StepCard
          key={guarantor.guarantorId ?? `new-${index}`}
          title={`Aval ${index + 1} · ${guarantor.label || 'Sin nombre'}`}
          description="INE y comprobante de domicilio son obligatorios."
        >
          {guarantor.guarantorId === undefined ? (
            <p
              className="typo-sm-text bg-warning-100/60 text-warning-800 flex items-center gap-2 rounded-lg px-4 py-3"
              role="note"
            >
              <UserRound className="size-4 shrink-0" aria-hidden />
              Guarda los cambios para poder subir los documentos de este aval.
            </p>
          ) : (
            <div className="grid items-start gap-5 lg:grid-cols-2">
              {GUARANTOR_DOCUMENT_TYPES.map((type) => (
                <DocumentUpload
                  key={type}
                  entityType="guarantor"
                  entityId={String(guarantor.guarantorId)}
                  documentType={type}
                  label={getDriverDocumentLabel(type)}
                  required={REQUIRED_GUARANTOR_DOCUMENT_TYPES.includes(type)}
                  errorModules={[...ERROR_MODULES]}
                  current={guarantorDocuments[guarantor.guarantorId as number]?.[type] ?? null}
                  onChange={(document) => onGuarantorDocumentChange(guarantor.guarantorId as number, type, document)}
                />
              ))}
            </div>
          )}
        </StepCard>
      ))}
    </div>
  );
};

export default DocumentsStep;
