'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      className="pageturn__icon"
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {direction === 'left' ? <polyline points="15 5 8 12 15 19" /> : <polyline points="9 5 16 12 9 19" />}
    </svg>
  );
}

/**
 * Turning the pages of a book.
 *
 * Only ever in the reader — the website has its tabs. The buttons sit on the
 * desk to either side of the volume, vertically centred, so they fall under the
 * hand without ever covering the page you are reading. The book block clips its
 * contents and carries `contain`, so these are portalled to the body; anything
 * rendered in place would be cut off.
 */
export function ReaderNav({
  onPrev,
  onNext,
  canPrev,
  canNext,
  position,
}: {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  position: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <>
      <button
        type="button"
        className="pageturn pageturn--prev"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous page"
        title="Previous page"
      >
        <Chevron direction="left" />
      </button>

      <button
        type="button"
        className="pageturn pageturn--next"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next page"
        title="Next page"
      >
        <Chevron direction="right" />
      </button>

      {position ? <p className="pageturn__count">{position}</p> : null}
    </>,
    document.body,
  );
}
