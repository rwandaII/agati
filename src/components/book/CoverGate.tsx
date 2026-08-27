'use client';

import { useEffect, useState } from 'react';
import { Cover } from './Cover';

const KEY = 'agati:opened';

/**
 * Shows the cover once per browser session. The Home spread underneath is always
 * rendered, so the page is complete for crawlers and for anyone without JS.
 */
export function CoverGate() {
  // Assume open during SSR so the cover never flashes for returning readers.
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      setOpen(sessionStorage.getItem(KEY) === '1');
    } catch {
      setOpen(true); // storage blocked: do not trap the reader behind a cover
    }
  }, []);

  if (open) return null;

  return (
    <Cover
      onOpen={() => {
        try {
          sessionStorage.setItem(KEY, '1');
        } catch {
          /* ignore */
        }
        setOpen(true);
      }}
    />
  );
}
