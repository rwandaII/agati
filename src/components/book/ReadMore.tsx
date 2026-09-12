'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * A page that unfolds rather than one that scrolls inside itself.
 *
 * On a wide screen a page holds what it holds and the rest scrolls within it,
 * which is what a page does. On a phone that put a scrollbar down the middle of
 * the paper and a second scroll inside the one already moving the book — you
 * could not tell which of the two you were dragging.
 *
 * So where a page is shown on its own it is cut off at a comfortable height,
 * faded out where it stops, and opened the rest of the way by asking. Anything
 * short enough to fit is left alone: a button offering to reveal nothing is
 * worse than no button. On a spread — a desk, or a phone lying on its side —
 * nothing folds, because there the page scrolls as a page should.
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
    if (!el) return;

    const measure = () => {
      // Whether to fold at all is asked of the stylesheet, not of the window.
      // `--fold` is set only where a page is shown on its own; on a spread —
      // including a phone turned on its side, which no media query can see as
      // anything but a narrow screen — it is unset, and nothing folds.
      const limit = parseFloat(getComputedStyle(el).getPropertyValue('--fold')) || 0;
      setFoldable(limit > 0 && el.scrollHeight > limit + 24);
    };

    measure();

    const resize =
      typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    resize?.observe(el);

    // The stage publishes how the book is laid out on the document element,
    // and `--fold` follows it, so a re-measure follows that.
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
