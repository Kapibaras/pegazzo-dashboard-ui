'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Eye, FileText, Loader2, RefreshCw, Replace, UploadCloud, X } from 'lucide-react';
import { SingletonAPIClient } from '@/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/contexts/UserProvider';
import { useApiErrorHandler } from '@/hooks/errors/useApiErrorHandler';
import { isAbortError, NETWORK_ERROR_MESSAGE, normalizeApiError } from '@/helpers/apiError';
import { DOCUMENT_ACCEPT, IMAGE_ACCEPT, MAX_DOCUMENT_SIZE_MB } from '@/lib/vehicle';
import { Role } from '@/lib/schemas/userSchema';
import { cn } from '@/lib/utils';
import DocumentService from '@/services/documents';
import { ToastService } from '@/services/toast';
import { DocumentEntityType, DocumentRecord } from '@/types/vehicle';
import ViewFileButton from './ViewFileButton';

/** A document that is already stored for the entity (`url` is a presigned read URL). */
export type StoredDocument = { id: number; url: string };

type UploadState = 'idle' | 'uploading' | 'error';

export type DocumentUploadProps = {
  entityType: DocumentEntityType;
  entityId: string;
  /** Taxonomy key sent as `type` when the document record is confirmed (e.g. `invoice`). */
  documentType: string;
  label?: string;
  /** Marks the slot as mandatory (badge). The parent decides what to do when it is still empty. */
  required?: boolean;
  expiryDate?: string | null;
  accept?: readonly string[];
  maxSizeMB?: number;
  disabled?: boolean;
  /** The document already stored in this slot, if any. It can be replaced in place. */
  current?: StoredDocument | null;
  /** Called with the stored document after every upload/replace. */
  onChange?: (document: StoredDocument) => void;
  onUploaded?: (document: DocumentRecord) => void;
  onError?: (error: { status: number; detail: string }) => void;
  className?: string;
};

const ACCEPT_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WEBP',
};

/**
 * One document slot. Without a stored document it is a dropzone; with one it shows the document with "Ver" and
 * "Reemplazar". Replacing uploads the new file first and only then deletes the previous record, so a failed upload
 * never leaves the slot empty.
 */
const DocumentUpload = ({
  entityType,
  entityId,
  documentType,
  label,
  required = false,
  expiryDate,
  accept = DOCUMENT_ACCEPT,
  maxSizeMB = MAX_DOCUMENT_SIZE_MB,
  disabled = false,
  current = null,
  onChange,
  onUploaded,
  onError,
  className,
}: DocumentUploadProps) => {
  const { user } = useUser();
  const { handleApiError } = useApiErrorHandler();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [stored, setStored] = useState<StoredDocument | null>(current);
  const [state, setState] = useState<UploadState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const service = useMemo(() => new DocumentService(SingletonAPIClient.getInstance()), []);
  const isReadOnly = disabled || user.role === Role.EMPLOYEE;
  const acceptsImages = accept.some((type) => (IMAGE_ACCEPT as readonly string[]).includes(type));
  const acceptLabel = accept.map((type) => ACCEPT_LABELS[type] ?? type).join(', ');

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const validate = useCallback(
    (candidate: File): string | null => {
      if (!accept.includes(candidate.type)) return `Formato no permitido. Usa ${acceptLabel}.`;
      if (candidate.size > maxSizeMB * 1024 * 1024) return `El archivo supera el máximo de ${maxSizeMB} MB.`;
      if (candidate.size === 0) return 'El archivo está vacío.';
      return null;
    },
    [accept, acceptLabel, maxSizeMB],
  );

  const startUpload = useCallback(
    async (candidate: File) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState('uploading');
      setProgress(0);
      setMessage(null);

      try {
        const created = await service.upload(candidate, {
          entityType,
          entityId,
          documentType,
          expiryDate,
          onProgress: setProgress,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;

        const next: StoredDocument = { id: created.id, url: created.url };
        const previous = stored;
        setStored(next);
        setState('idle');
        onChange?.(next);
        onUploaded?.(created);

        // Replacing: the new document is already safe, so the old record (and its file) can go now.
        if (previous && previous.id !== next.id) {
          try {
            await service.delete(previous.id);
          } catch {
            ToastService.info(
              'Documento reemplazado',
              'El documento anterior no se pudo eliminar; avisa a un administrador.',
            );
          }
        }
      } catch (error) {
        if (controller.signal.aborted || isAbortError(error)) return;

        const apiError = normalizeApiError(error, 'No se pudo subir el archivo.');
        setState('error');
        onError?.(apiError);
        if (apiError.status === 0) {
          setMessage(NETWORK_ERROR_MESSAGE);
          return;
        }
        setMessage('No se pudo subir el archivo. Inténtalo de nuevo.');
        await handleApiError(apiError, ['common', 'vehicles']);
      }
    },
    [service, entityType, entityId, documentType, expiryDate, stored, onChange, onUploaded, onError, handleApiError],
  );

  const handleFile = useCallback(
    (candidate: File | undefined) => {
      if (!candidate || isReadOnly) return;

      const validationError = validate(candidate);
      if (validationError) {
        setState('error');
        setFile(null);
        setPreviewUrl(null);
        setMessage(validationError);
        return;
      }

      setFile(candidate);
      setPreviewUrl(candidate.type.startsWith('image/') ? URL.createObjectURL(candidate) : null);
      void startUpload(candidate);
    },
    [isReadOnly, validate, startUpload],
  );

  const openPicker = () => {
    if (!isReadOnly) inputRef.current?.click();
  };

  /** Leaves the failed/uploading state: back to the stored document, or to the empty dropzone. */
  const dismiss = () => {
    abortRef.current?.abort();
    setState('idle');
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
    setMessage(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const showProgress = !!file && (state === 'uploading' || state === 'error');
  const showDropzone = !stored && !showProgress;
  // A rejected file (wrong type/size) never reaches the progress card, so the stored document stays visible.
  const showStored = !!stored && !showProgress;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <div className="flex items-center gap-2">
          <label htmlFor={inputId} className="typo-sm-text text-carbon-400 font-medium">
            {label}
          </label>
          {required && (
            <Badge className="bg-error-50 text-error-700 hover:bg-error-50 px-1.5 py-0 text-[10px]">Obligatorio</Badge>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="sr-only"
        accept={accept.join(',')}
        disabled={isReadOnly}
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />

      {showDropzone && (
        <div
          role="button"
          tabIndex={isReadOnly ? -1 : 0}
          aria-disabled={isReadOnly}
          aria-label={label ? `Subir ${label}` : 'Subir documento'}
          onClick={openPicker}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openPicker();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!isReadOnly) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFile(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            'border-surface-700/60 bg-surface-400 flex flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
            isReadOnly
              ? 'cursor-not-allowed opacity-60'
              : 'hover:border-primary-700 hover:bg-primary-50 cursor-pointer',
            isDragging && 'border-primary-700 bg-primary-50',
          )}
        >
          <UploadCloud className="text-primary-700 size-7" aria-hidden />
          <p className="typo-sm-text text-carbon-400">
            {isReadOnly ? 'Solo lectura' : 'Arrastra el archivo aquí o haz clic para subir'}
          </p>
          <p className="typo-sm-text text-carbon-300 text-xs">
            {acceptLabel} · máx. {maxSizeMB} MB
          </p>
          {acceptsImages && !isReadOnly && (
            <p className="text-carbon-300 max-w-sm text-xs">
              Tip: fotografía el documento recto, bien iluminado, completo y sin reflejos del flash.
            </p>
          )}
        </div>
      )}

      {showProgress && file && (
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg border p-3',
            state === 'error' ? 'border-error-100 bg-error-50' : 'border-surface-600 bg-white',
          )}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="size-14 shrink-0 rounded-md object-cover" />
          ) : (
            <div className="bg-primary-50 flex size-14 shrink-0 items-center justify-center rounded-md">
              <FileText className="text-primary-700 size-6" aria-hidden />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="typo-sm-text text-carbon-500 truncate font-medium">{file.name}</p>
            <p className="text-carbon-300 text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            {state === 'uploading' && (
              <div className="mt-2 flex items-center gap-2">
                <Progress value={progress} aria-label="Progreso de subida" className="flex-1" />
                <span className="text-carbon-300 w-9 text-right text-xs tabular-nums">{progress}%</span>
              </div>
            )}
            {state === 'error' && message && (
              <p role="alert" className="text-error-700 mt-1 text-xs">
                {message}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {state === 'uploading' && <Loader2 className="text-primary-700 size-4 animate-spin" aria-hidden />}
            {state === 'error' && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Reintentar subida"
                onClick={() => void startUpload(file)}
                disabled={isReadOnly}
              >
                <RefreshCw className="size-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={state === 'uploading' ? 'Cancelar subida' : 'Descartar archivo'}
              onClick={dismiss}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {showStored && stored && (
        <div className="border-success-500/40 flex items-center gap-3 rounded-lg border bg-white p-3">
          <div className="bg-success-50 flex size-12 shrink-0 items-center justify-center rounded-md">
            <FileText className="text-success-700 size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="typo-sm-text text-carbon-500 truncate font-medium">{file?.name ?? label ?? 'Documento'}</p>
            <p className="text-success-700 flex items-center gap-1 text-xs">
              <CheckCircle2 className="size-3.5" aria-hidden /> Documento cargado
            </p>
          </div>
          <ViewFileButton
            items={[{ url: stored.url, title: label ?? 'Documento' }]}
            aria-label={`Ver ${label ?? 'documento'}`}
            className="text-primary-800 flex cursor-pointer items-center gap-1 text-sm font-medium hover:underline"
          >
            Ver <Eye className="size-3.5" aria-hidden />
          </ViewFileButton>
          {!isReadOnly && (
            <Button type="button" variant="outline" size="sm" onClick={openPicker} className="cursor-pointer gap-1.5">
              <Replace className="size-3.5" aria-hidden /> Reemplazar
            </Button>
          )}
        </div>
      )}

      {state === 'error' && !file && message && (
        <p role="alert" className="text-error-700 text-xs">
          {message}
        </p>
      )}
    </div>
  );
};

export default DocumentUpload;
