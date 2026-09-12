'use client';

import { useState } from 'react';
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
  // Closed from the very first paint. The page behind it is still rendered and
  // still in the HTML — the cover is laid over it, not instead of it — so this
  // costs nothing in search results, and a reload shows you a closed book
  // rather than the inside of one for a moment before the cover arrives.
  //
  // Read straight out of the flag rather than corrected by an effect. On the
  // server the flag is always false, which is right for a page being loaded;
  // moving about inside the book is a client render with no server rendering
  // to disagree with, so the two can never be out of step.
  const [open, setOpen] = useState(() => openedThisVisit);

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
