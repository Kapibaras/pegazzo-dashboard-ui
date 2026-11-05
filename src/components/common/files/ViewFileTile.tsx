'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import FileViewer, { ViewerItem } from './FileViewer';

type ViewFileTileProps = {
  items: ViewerItem[];
  startIndex?: number;
  className?: string;
  'aria-label': string;
  children: React.ReactNode;
};

/**
 * A whole tile (row, card) that opens the in-app viewer when clicked anywhere. Buttons and links inside it keep their
 * own action (clicks on them do not open the viewer).
 */
const ViewFileTile = ({ items, startIndex = 0, className, children, ...rest }: ViewFileTileProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={rest['aria-label']}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('button, a')) return;
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          'focus-visible:ring-primary-700 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset',
          className,
        )}
      >
        {children}
      </div>
      <FileViewer open={open} onOpenChange={setOpen} items={items} startIndex={startIndex} />
    </>
  );
};

export default ViewFileTile;
