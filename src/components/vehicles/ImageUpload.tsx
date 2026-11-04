'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IMAGE_ACCEPT, MAX_IMAGE_SIZE_MB } from '@/lib/vehicle';
import { cn } from '@/lib/utils';

/** An image held by the form: either already stored (`url`) or staged locally (`file`) until the save chain runs. */
export type ImageItem = {
  id: string;
  /** Public URL (existing image) or object URL (staged file preview). */
  previewUrl: string;
  /** Present only for images that still have to be uploaded. */
  file?: File;
};

export const createStagedImage = (file: File): ImageItem => ({
  id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
  previewUrl: URL.createObjectURL(file),
  file,
});

export const createExistingImage = (url: string): ImageItem => ({ id: url, previewUrl: url });

type ImageUploadProps = {
  items: ImageItem[];
  onChange: (items: ImageItem[]) => void;
  max?: number;
  label: string;
  hint?: string;
  disabled?: boolean;
  /** Copy for the empty dropzone. */
  emptyText?: string;
  onError?: (message: string) => void;
  className?: string;
};

/**
 * Staged image picker (agency image: `max=1`, vehicle photos: `max=4`). Selecting a file only stores it locally;
 * the wizard uploads the binaries during its save chain so a failure never leaves a half-created car.
 */
const ImageUpload = ({
  items,
  onChange,
  max = 1,
  label,
  hint,
  disabled,
  emptyText = 'Arrastra la imagen aquí o haz clic para subir',
  onError,
  className,
}: ImageUploadProps) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const isFull = items.length >= max;

  // Object URLs of staged files are revoked when the component unmounts.
  useEffect(
    () => () => {
      itemsRef.current.filter((item) => item.file).forEach((item) => URL.revokeObjectURL(item.previewUrl));
    },
    [],
  );

  const reportError = useCallback(
    (message: string | null) => {
      setError(message);
      if (message) onError?.(message);
    },
    [onError],
  );

  const addFiles = useCallback(
    (fileList: FileList | File[] | null | undefined) => {
      if (!fileList || disabled) return;
      const incoming = Array.from(fileList);
      const slots = max - items.length;
      const accepted: ImageItem[] = [];
      let problem: string | null = null;

      for (const file of incoming) {
        if (!(IMAGE_ACCEPT as readonly string[]).includes(file.type)) {
          problem = `«${file.name}» no es un formato válido. Usa JPG, PNG o WEBP.`;
        } else if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
          problem = `«${file.name}» supera el máximo de ${MAX_IMAGE_SIZE_MB} MB.`;
        } else if (accepted.length >= slots) {
          problem = `Solo puedes agregar ${max} ${max === 1 ? 'imagen' : 'imágenes'}.`;
        } else {
          accepted.push(createStagedImage(file));
        }
      }

      reportError(problem);
      if (accepted.length > 0) onChange([...items, ...accepted]);
      if (inputRef.current) inputRef.current.value = '';
    },
    [disabled, items, max, onChange, reportError],
  );

  const remove = (item: ImageItem) => {
    if (item.file) URL.revokeObjectURL(item.previewUrl);
    reportError(null);
    onChange(items.filter((candidate) => candidate.id !== item.id));
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="text-carbon-400 text-sm font-medium">
          {label}
        </label>
        {max > 1 && (
          <span className="text-carbon-200 text-xs">
            {items.length}/{max}
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple={max > 1}
        accept={IMAGE_ACCEPT.join(',')}
        className="sr-only"
        disabled={disabled || isFull}
        onChange={(event) => addFiles(event.target.files)}
      />

      <div className="flex flex-wrap gap-3">
        {items.map((item, index) => (
          <div key={item.id} className="border-surface-600/70 group relative h-[100px] w-[140px] overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.previewUrl} alt={`${label} ${index + 1}`} className="size-full object-cover" />
            {item.file && (
              <span className="bg-primary-700 absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-white">
                Nueva
              </span>
            )}
            {!disabled && (
              <button
                type="button"
                aria-label={`Quitar ${label} ${index + 1}`}
                onClick={() => remove(item)}
                className="absolute top-1 right-1 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-90 hover:bg-black/80"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ))}

        {!isFull && (
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            aria-label={`Agregar ${label.toLowerCase()}`}
            onClick={() => !disabled && inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (!disabled) inputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (!disabled) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              addFiles(event.dataTransfer.files);
            }}
            className={cn(
              'border-surface-700/60 bg-surface-400 text-carbon-300 flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-3 text-center text-xs transition-colors',
              items.length === 0 ? 'min-h-[100px] w-full max-w-xl py-5' : 'h-[100px] w-[140px]',
              disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-primary-700 hover:bg-primary-50 cursor-pointer',
              isDragging && 'border-primary-700 bg-primary-50',
            )}
          >
            <ImagePlus className="text-primary-700 size-6" aria-hidden />
            {items.length === 0 ? (
              <>
                <span className="text-sm">{emptyText}</span>
                <span className="text-carbon-200">JPG, PNG o WEBP · máx. {MAX_IMAGE_SIZE_MB} MB</span>
                <Button type="button" variant="outline" size="sm" tabIndex={-1} className="pointer-events-none mt-1 h-7">
                  Subir {max > 1 ? 'fotos' : 'imagen'}
                </Button>
              </>
            ) : (
              <span>Agregar</span>
            )}
          </div>
        )}
      </div>

      {hint && !error && <p className="text-carbon-200 text-xs">{hint}</p>}
      {error && (
        <p role="alert" className="text-error-700 text-xs">
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
