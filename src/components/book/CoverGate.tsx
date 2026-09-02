'use client';

import { useEffect, useState } from 'react';
import { Cover } from './Cover';

/**
 * The closed book is the welcome page.
 *
 * The flag lives in module scope, not in storage, which gives exactly the
 * behaviour we want: every time the app is started or the page reloaded the
 * cover greets you, but stepping back to Home from inside the book does not
 * shut it in your face.
 */
let openedThisVisit = false;

export function CoverGate() {
  // Assume open during SSR so the cover never flashes into a rendered page.
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(openedThisVisit);
  }, []);

  if (open) return null;

  return (
    <Cover
      onOpen={() => {
        openedThisVisit = true;
        setOpen(true);
      }}
    />
  );
}
