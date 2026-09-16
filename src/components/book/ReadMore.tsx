'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * A page that unfolds rather than scrolling inside itself.
 *
 * On a wide screen the overflow scrolls within the page, which is what a page
 * does. On a phone that gave us a scrollbar down the middle of the paper plus
 * a second scroll inside the one already moving the book, and you couldn't
 * tell which of the two you were dragging.
 *
 * So a page shown on its own is cut off at a comfortable height, faded where
 * it stops, and opened the rest of the way on request. Short pages are left
 * alone, a button that reveals nothing is worse than no button. Nothing folds
 * on a spread.
 */
export function ReadMore({ children }: { children: ReactNode }) {
  const body = useRef<HTMLDivElement | null>(null);
  const [foldable, setFoldable] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = body.current;
    // none of this is essential: without it the page just shows in full, which
    // is what it does on a wide screen anyway
    if (!el) return;

    const measure = () => {
      // the stylesheet decides whether to fold, not the window. --fold is only
      // set where a page is shown on its own, and no media query can tell a
      // rotated phone from a narrow screen.
      const limit = parseFloat(getComputedStyle(el).getPropertyValue('--fold')) || 0;
      setFoldable(limit > 0 && el.scrollHeight > limit + 24);
    };

    measure();

    const resize =
      typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    resize?.observe(el);

    // --fold follows the stage layout published on the document element
    const watch =
      typeof MutationObserver === 'function' ? new MutationObserver(measure) : null;
    watch?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-leaves', 'data-turn', 'data-stage'],
    });

    return () => {
      resize?.disconnect();
      watch?.disconnect();
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
