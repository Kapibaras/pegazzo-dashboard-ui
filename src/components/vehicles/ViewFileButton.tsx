'use client';

import { useState } from 'react';
import FileViewer, { ViewerItem } from './FileViewer';

type ViewFileButtonProps = {
  /** Everything the viewer can page through (e.g. all the photos); `startIndex` is the one that was clicked. */
  items: ViewerItem[];
  startIndex?: number;
  className?: string;
  'aria-label'?: string;
  children: React.ReactNode;
};

/** A button that opens the in-app viewer. Used in server components, where the open state cannot live. */
const ViewFileButton = ({ items, startIndex = 0, className, children, ...rest }: ViewFileButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={className} aria-label={rest['aria-label']} onClick={() => setOpen(true)}>
        {children}
      </button>
      <FileViewer open={open} onOpenChange={setOpen} items={items} startIndex={startIndex} />
    </>
  );
};

export default ViewFileButton;
