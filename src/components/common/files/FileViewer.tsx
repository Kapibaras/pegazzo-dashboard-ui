'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, FileQuestion, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { getFileKind } from '@/lib/fileKind';

export type ViewerItem = { url: string; title: string };

type FileViewerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ViewerItem[];
  startIndex?: number;
};

/**
 * In-app viewer for photos and documents (images inline, PDFs in a frame, anything else offers a new-tab link).
 * Closes with ESC, a click on the backdrop or the close button; ← / → move between items when there are several.
 */
const FileViewer = ({ open, onOpenChange, items, startIndex = 0 }: FileViewerProps) => {
  const [index, setIndex] = useState(startIndex);
  const [failed, setFailed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setIndex(startIndex);
      setFailed(false);
    }
  }, [open, startIndex]);

  const current = items[Math.min(index, items.length - 1)];
  const many = items.length > 1;

  const go = (delta: number) => {
    setFailed(false);
    setIndex((prev) => (prev + delta + items.length) % items.length);
  };

  if (!current) return null;
  const kind = getFileKind(current.url);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        showCloseButton={false}
        className="flex h-[88vh] w-[min(1100px,calc(100vw-2rem))] max-w-none flex-col gap-0 overflow-hidden border-0 bg-neutral-950 p-0 sm:max-w-none"
        onKeyDown={(event) => {
          if (!many) return;
          if (event.key === 'ArrowLeft') go(-1);
          if (event.key === 'ArrowRight') go(1);
        }}
      >
        <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <DialogTitle className="typo-label min-w-0 flex-1 truncate text-white">
            {current.title}
            {many && <span className="ml-2 font-normal text-white/60">{`${index + 1} de ${items.length}`}</span>}
          </DialogTitle>
          <DialogDescription className="sr-only">Vista previa. Presiona Esc para cerrar.</DialogDescription>
          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            className="typo-caption flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="size-3.5" aria-hidden /> Abrir en pestaña nueva
          </a>
          <button
            type="button"
            aria-label="Cerrar visor"
            onClick={() => onOpenChange(false)}
            className="flex size-8 cursor-pointer items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="relative flex min-h-0 flex-1 items-center justify-center p-3">
          {failed || kind === 'other' ? (
            <div className="flex flex-col items-center gap-3 text-center text-white/80">
              <FileQuestion className="size-10" aria-hidden />
              <p className="typo-sm-text">
                {failed ? 'No se pudo cargar la vista previa.' : 'Este tipo de archivo no tiene vista previa.'}
              </p>
              <a
                href={current.url}
                target="_blank"
                rel="noopener noreferrer"
                className="typo-label cursor-pointer rounded-md bg-white/10 px-3 py-1.5 text-white transition-colors hover:bg-white/20"
              >
                Abrir en pestaña nueva
              </a>
            </div>
          ) : kind === 'pdf' ? (
            <iframe
              key={current.url}
              src={current.url}
              title={current.title}
              // The browser's PDF viewer takes the focus and swallows Esc: give it back to the dialog once loaded.
              onLoad={() => window.setTimeout(() => contentRef.current?.focus(), 100)}
              className="size-full rounded-md bg-white"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={current.url}
              src={current.url}
              alt={current.title}
              onError={() => setFailed(true)}
              className="max-h-full max-w-full rounded-md object-contain"
            />
          )}

          {many && (
            <>
              <button
                type="button"
                aria-label="Anterior"
                onClick={() => go(-1)}
                className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                <ChevronLeft className="size-6" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Siguiente"
                onClick={() => go(1)}
                className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                <ChevronRight className="size-6" aria-hidden />
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewer;
