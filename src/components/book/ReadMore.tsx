'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Below this the page stops scrolling inside itself and unfolds instead. */
const NARROW = '(max-width: 780px)';

/**
 * A page that unfolds rather than one that scrolls inside itself.
 *
 * On a wide screen a page holds what it holds and the rest scrolls within it,
 * which is what a page does. On a phone that put a scrollbar down the middle of
 * the paper and a second scroll inside the one already moving the book — you
 * could not tell which of the two you were dragging.
 *
 * So on a narrow screen the page is cut off at a comfortable height, faded out
 * where it stops, and opened the rest of the way by asking. Anything short
 * enough to fit is left alone: a button offering to reveal nothing is worse
 * than no button.
 */
export function ReadMore({ children }: { children: ReactNode }) {
  const body = useRef<HTMLDivElement | null>(null);
  const [foldable, setFoldable] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = body.current;
    // Nothing here is essential: without it the page simply shows in full,
    // which is what it does on a wide screen anyway. So every part of it is
    // optional, and a browser (or a test) missing any of it still gets a page.
    if (!el || typeof window.matchMedia !== 'function') return;

    const narrow = window.matchMedia(NARROW);

    const measure = () => {
      if (!narrow.matches) {
        setFoldable(false);
        return;
      }
      // Compare against the height the fold would impose, taken from the
      // stylesheet so the two can never drift apart.
      const limit = parseFloat(getComputedStyle(el).getPropertyValue('--fold')) || 0;
      setFoldable(limit > 0 && el.scrollHeight > limit + 24);
    };

    measure();

    const resize =
      typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    resize?.observe(el);

    // Safari only grew `addEventListener` on a media query list in 14.
    narrow.addEventListener?.('change', measure);

    return () => {
      resize?.disconnect();
      narrow.removeEventListener?.('change', measure);
    };
  }, [children]);

  return (
    <div className={`fold ${foldable && !open ? 'fold--closed' : ''}`}>
      <div className="page__body" ref={body}>
        {children}
      </div>

      {foldable && !open ? (
        <button type="button" className="fold__more" onClick={() => setOpen(true)}>
          Read more
        </button>
      ) : null}
    </div>
  );
}
