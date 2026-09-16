'use client';

import { useState } from 'react';
import { Cover } from './Cover';

/**
 * The closed book is the welcome page.
 *
 * The flag is module scope rather than storage, which is exactly the behaviour
 * we want: the cover greets you on every load, but going back to Home from
 * inside the book doesn't shut it in your face.
 */
let openedThisVisit = false;

export function CoverGate() {
  // Closed from the first paint. The page behind is still rendered and still in
  // the HTML, the cover just lies over it, so this costs nothing in search
  // results and a reload doesn't flash the inside of the book first.
  //
  // Read straight out of the flag rather than corrected by an effect. On the
  // server it is always false, which is right for a page being loaded, and
  // moving around inside the book is client-only, so the two can't disagree.
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
